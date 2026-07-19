// ============================================================
// Interactive node-graph for graph-shaped topics, rendered with
// React Flow. Three layers of interactivity:
//   1. free exploration — pan (drag / touch), pinch or ⊕ zoom,
//      minimap, click a node for its detail in the side panel;
//   2. guided WALKTHROUGH — step through the concept: the camera
//      flies to the focused nodes, everything else dims, and each
//      step carries 2–4 sentences of deep analysis;
//   3. fullscreen — the same canvas maximized via a portal
//      (pattern borrowed from aws-learn-app's DiagramViewport).
// ============================================================
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { DiagramNode, TopicDiagramData, WalkStep } from "../lib/diagrams/types";

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

// Module scope so React Flow doesn't warn about identity churn.
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

function buildNodes(data: TopicDiagramData): Node<TopicNodeData>[] {
  return data.nodes.map((n) => ({
    id: n.id,
    type: "topic",
    position: { x: n.x, y: n.y },
    data: { label: n.label, desc: n.desc, kind: n.kind },
  }));
}

function buildEdges(data: TopicDiagramData, byId: Map<string, DiagramNode>): Edge[] {
  return data.edges.map((e) => {
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
      data: { baseAnimated: e.animated ?? false },
    } as Edge;
  });
}

// Camera: fly to the current step's focused nodes (or back to the
// whole graph when the walkthrough ends / isn't running).
function StepCamera({ step }: { step: WalkStep | null }) {
  const rf = useReactFlow();
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (step && step.focus.length > 0) {
        void rf.fitView({
          nodes: step.focus.map((id) => ({ id })),
          padding: 0.45,
          duration: 550,
          maxZoom: 1.35,
        });
      } else {
        void rf.fitView({ padding: 0.18, duration: 450 });
      }
    }, 60); // let the flow mount/measure before flying
    return () => window.clearTimeout(t);
  }, [step, rf]);
  return null;
}

export function TopicDiagram({ data }: { data: TopicDiagramData }) {
  const [selected, setSelected] = useState<DiagramNode | null>(null);
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const [maximized, setMaximized] = useState(false);

  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const steps = data.steps ?? [];
  const step = stepIdx !== null ? steps[stepIdx] ?? null : null;

  const [nodes, setNodes, onNodesChange] = useNodesState(useMemo(() => buildNodes(data), [data]));
  const [edges, setEdges, onEdgesChange] = useEdgesState(useMemo(() => buildEdges(data, byId), [data, byId]));

  // Apply / clear the walkthrough highlight when the step changes.
  useEffect(() => {
    const focus = step ? new Set(step.focus) : null;
    const edgeFocus = step ? new Set(step.edgeFocus ?? []) : null;
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        className: focus ? (focus.has(n.id) ? "rf-walk-focus" : "rf-walk-dim") : undefined,
      }))
    );
    setEdges((es) =>
      es.map((e) => {
        const on = edgeFocus ? edgeFocus.has(e.id) : true;
        return {
          ...e,
          animated: on ? Boolean((e.data as { baseAnimated?: boolean } | undefined)?.baseAnimated) : false,
          style: { ...e.style, opacity: on ? 1 : 0.12, strokeWidth: on && edgeFocus ? 2.4 : 1.6 },
          labelStyle: { ...e.labelStyle, opacity: on ? 1 : 0.1 },
        };
      })
    );
  }, [step, setNodes, setEdges]);

  // Esc leaves fullscreen; body scroll locks while it's open.
  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMaximized(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [maximized]);

  const startWalk = useCallback(() => {
    setSelected(null);
    setStepIdx(0);
  }, []);
  const exitWalk = useCallback(() => setStepIdx(null), []);

  const walkBar =
    steps.length > 0 && (
      <div className="walkbar">
        {step === null ? (
          <>
            <button type="button" className="btn small primary" onClick={startWalk}>
              ▶ Start walkthrough
            </button>
            <span className="walk-hint">
              {steps.length} guided steps — the camera follows, each step explains one idea.
            </span>
          </>
        ) : (
          <>
            <div className="walk-controls">
              <button
                type="button"
                className="btn small"
                disabled={stepIdx === 0}
                onClick={() => setStepIdx((i) => Math.max(0, (i ?? 0) - 1))}
              >
                ← Prev
              </button>
              <span className="walk-count mono">
                {(stepIdx ?? 0) + 1} / {steps.length}
              </span>
              {(stepIdx ?? 0) < steps.length - 1 ? (
                <button type="button" className="btn small primary" onClick={() => setStepIdx((i) => (i ?? 0) + 1)}>
                  Next →
                </button>
              ) : (
                <button type="button" className="btn small primary" onClick={exitWalk}>
                  ✓ Finish
                </button>
              )}
              <button type="button" className="btn small ghost" onClick={exitWalk}>
                Exit
              </button>
            </div>
            <div className="walk-step">
              <b>{step.title}</b>
              <p>{step.text}</p>
            </div>
          </>
        )}
      </div>
    );

  const canvas = (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={2.2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        zoomOnScroll={maximized}
        preventScrolling={maximized}
        onNodeClick={(_, node) => setSelected(byId.get(node.id) ?? null)}
        onPaneClick={() => setSelected(null)}
      >
        <StepCamera step={step} />
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#d8dce3" />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={(n) => KIND_STROKE[(n.data as TopicNodeData).kind ?? "default"]} />
      </ReactFlow>
    </ReactFlowProvider>
  );

  const legend = data.legend && (
    <div className="diagram-legend">
      {data.legend.map((l, i) => (
        <span key={i} className="legend-item">
          <span className={`legend-swatch sw-${l.swatch}`} />
          {l.text}
        </span>
      ))}
    </div>
  );

  const panel = (
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
      ) : step ? (
        <p className="diagram-panel-hint">
          Walkthrough running — dimmed nodes are out of focus for this step. Tap any node to inspect it.
        </p>
      ) : (
        <p className="diagram-panel-hint">Tap any node to see what it does and how it connects.</p>
      )}
    </div>
  );

  // The body renders in exactly one place at a time (inline OR the
  // fullscreen portal) so walkthrough position survives toggling.
  const body = (full: boolean) => (
    <>
      {legend}
      <div className={`diagram-stage${full ? " full" : ""}`}>
        <div className="diagram-canvas">
          <button
            type="button"
            className="diagram-max mono"
            title={full ? "Close full screen (Esc)" : "Full screen"}
            onClick={() => setMaximized(!full ? true : false)}
          >
            {full ? "✕" : "⛶"}
          </button>
          {canvas}
        </div>
        {panel}
      </div>
      {walkBar}
    </>
  );

  return (
    <div className="diagram-block">
      <div className="diagram-head">
        <b>{data.title}</b>
        <span className="diagram-hint mono">drag to pan · pinch / ⊕ to zoom · ⛶ full screen</span>
      </div>
      {data.caption && <p className="diagram-caption">{data.caption}</p>}
      {maximized ? (
        <>
          <div className="diagram-placeholder mono">Opened in full screen — press Esc or ✕ to return.</div>
          {createPortal(
            <div className="diagram-modal">
              <div className="diagram-modal-head">
                <b>{data.title}</b>
                <button type="button" className="btn small ghost" onClick={() => setMaximized(false)}>
                  ✕ Close
                </button>
              </div>
              <div className="diagram-modal-body">{body(true)}</div>
            </div>,
            document.body
          )}
        </>
      ) : (
        body(false)
      )}
    </div>
  );
}
