// ============================================================
// Shared interactive node-graph for graph-shaped topics. Renders
// a library-agnostic TopicDiagramData (see src/lib/diagrams) with
// React Flow: pan (drag / one-finger), zoom (pinch / controls),
// minimap, fit-view. Clicking a node opens a detail side panel.
//
// Viewing a diagram is recorded as a soft completion signal via
// markDiagramViewed(topicId).
// ============================================================
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { DiagramNode, TopicDiagramData } from "../lib/diagrams/types";
import { useProgress } from "../lib/progress";

type TopicNodeData = {
  label: string;
  desc?: string;
  kind?: string;
};

const SIDES = [
  { key: "top", pos: Position.Top },
  { key: "right", pos: Position.Right },
  { key: "bottom", pos: Position.Bottom },
  { key: "left", pos: Position.Left },
] as const;

// One read-only node. Handles on all four sides (invisible) let an
// edge attach to whichever side faces its neighbour.
function TopicNode({ data, selected }: NodeProps<Node<TopicNodeData>>) {
  return (
    <div className={`rf-node rf-${data.kind ?? "default"}${selected ? " rf-selected" : ""}`}>
      {SIDES.map((s) => (
        <Fragment key={s.key}>
          <Handle id={`t-${s.key}`} type="target" position={s.pos} className="rf-handle" isConnectable={false} />
          <Handle id={`s-${s.key}`} type="source" position={s.pos} className="rf-handle" isConnectable={false} />
        </Fragment>
      ))}
      <div className="rf-node-label">{data.label}</div>
      {data.desc && <div className="rf-node-desc">{data.desc}</div>}
    </div>
  );
}

// Defined at module scope so React Flow doesn't warn about a new
// object identity on every render.
const nodeTypes = { topic: TopicNode };

// Pick which handles an edge connects, so lines look tidy for any
// topology. Vertical flow always runs bottom → top; free flow uses
// the dominant axis between the two nodes.
function pickHandles(from: DiagramNode, to: DiagramNode, flow: TopicDiagramData["flow"]) {
  if (flow !== "free") return { sourceHandle: "s-bottom", targetHandle: "t-top" };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "s-right", targetHandle: "t-left" }
      : { sourceHandle: "s-left", targetHandle: "t-right" };
  }
  return dy >= 0
    ? { sourceHandle: "s-bottom", targetHandle: "t-top" }
    : { sourceHandle: "s-top", targetHandle: "t-bottom" };
}

const KIND_STROKE: Record<string, string> = {
  accent: "#7a5a0a",
  blue: "#1d5a95",
  green: "#1a7f4e",
  danger: "#b3261e",
  muted: "#8b93a1",
  default: "#4b5563",
};

export function TopicDiagram({ data, topicId }: { data: TopicDiagramData; topicId: string }) {
  const { markDiagramViewed } = useProgress();
  const [selected, setSelected] = useState<DiagramNode | null>(null);

  // Viewing the diagram is a soft "explored this" signal.
  useEffect(() => {
    markDiagramViewed(topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);

  const nodes = useMemo<Node<TopicNodeData>[]>(
    () =>
      data.nodes.map((n) => ({
        id: n.id,
        type: "topic",
        position: { x: n.x, y: n.y },
        data: { label: n.label, desc: n.desc, kind: n.kind },
      })),
    [data]
  );

  const edges = useMemo<Edge[]>(
    () =>
      data.edges.map((e) => {
        const from = byId.get(e.from);
        const to = byId.get(e.to);
        const handles = from && to ? pickHandles(from, to, data.flow) : {};
        const stroke = KIND_STROKE[from?.kind ?? "default"] ?? KIND_STROKE.default;
        return {
          id: e.id,
          source: e.from,
          target: e.to,
          ...handles,
          label: e.label,
          animated: e.animated,
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 16, height: 16 },
          style: { stroke, strokeWidth: 1.6, strokeDasharray: e.dashed ? "6 4" : undefined },
          labelStyle: { fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fill: "#4b5563" },
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9 },
        } as Edge;
      }),
    [data, byId]
  );

  return (
    <div className="diagram-block">
      <div className="diagram-head">
        <b>{data.title}</b>
        <span className="diagram-hint mono">interactive · drag to pan · pinch / ⊕ to zoom</span>
      </div>
      {data.caption && <p className="diagram-caption">{data.caption}</p>}
      <div className="diagram-stage">
        <div className="diagram-canvas">
          <ReactFlow
            defaultNodes={nodes}
            defaultEdges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.3}
            maxZoom={2}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesFocusable={false}
            zoomOnScroll={false}
            preventScrolling={false}
            proOptions={{ hideAttribution: false }}
            onNodeClick={(_, node) => setSelected(byId.get(node.id) ?? null)}
            onPaneClick={() => setSelected(null)}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#d8dce3" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor={(n) => KIND_STROKE[(n.data as TopicNodeData).kind ?? "default"]} />
          </ReactFlow>
        </div>
        <div className="diagram-panel">
          {selected ? (
            <>
              <div className="diagram-panel-label">{selected.label}</div>
              {selected.desc && <div className="diagram-panel-desc mono">{selected.desc}</div>}
              <p>{selected.detail ?? "No extra detail for this node."}</p>
              <button type="button" className="btn small ghost" onClick={() => setSelected(null)}>
                Clear
              </button>
            </>
          ) : (
            <p className="diagram-panel-hint">Tap any node to see what it does and how it connects.</p>
          )}
        </div>
      </div>
    </div>
  );
}
