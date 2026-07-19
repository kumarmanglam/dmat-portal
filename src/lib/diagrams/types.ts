// ============================================================
// Library-agnostic diagram data. Every topic registers one or
// more visuals in src/lib/diagrams/index.ts, keyed by topic id.
// Two visual kinds:
//   - "flow"    → interactive node graph (React Flow renderer),
//                 optionally with a guided step-by-step walkthrough
//   - "mermaid" → text-defined diagram (sequence / ER / class /
//                 flowchart / state), rendered by mermaid.js
// Keeping the data decoupled from the libraries means swapping
// renderers never touches the per-topic files in this folder.
// ============================================================

// Colour role of a node — mapped to theme tokens by the renderer.
export type NodeKind = "default" | "accent" | "blue" | "green" | "muted" | "danger";

export interface DiagramNode {
  id: string;
  label: string; // bold headline in the node
  desc?: string; // one short supporting line under the label
  detail?: string; // longer text revealed in the side panel on click
  x: number;
  y: number;
  kind?: NodeKind;
}

export interface DiagramEdge {
  id: string;
  from: string; // source node id
  to: string; // target node id
  label?: string;
  dashed?: boolean;
  animated?: boolean;
}

// One step of a guided walkthrough: the camera zooms to the
// focused nodes, everything else dims, and the analysis text is
// shown. This sequential guiding is the retention feature — it
// forces attention through the diagram in the right order.
export interface WalkStep {
  title: string;
  text: string; // 2–3 sentences of deep analysis for this step
  focus: string[]; // node ids highlighted (camera fits to these)
  edgeFocus?: string[]; // edge ids highlighted
}

export interface LegendEntry {
  swatch: NodeKind; // colour chip shown next to the text
  text: string;
}

export interface TopicDiagramData {
  title: string;
  caption?: string; // how to read the diagram (shown above the canvas)
  // "vertical" (default): edges always run bottom → top (trees, layer stacks).
  // "free": edges attach to whichever side faces the target (cycles, meshes).
  flow?: "vertical" | "free";
  legend?: LegendEntry[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  steps?: WalkStep[]; // guided walkthrough (strongly recommended)
}

// ---------- Visual kinds ----------
export interface FlowVisual {
  kind: "flow";
  data: TopicDiagramData;
}

export interface MermaidVisual {
  kind: "mermaid";
  title: string;
  caption?: string; // how to read it
  chart: string; // mermaid source (flowchart / sequenceDiagram / erDiagram / classDiagram / stateDiagram-v2)
  // "Deep analysis" bullets rendered under the chart — the why
  // behind what the picture shows.
  notes?: { label: string; text: string }[];
}

export type TopicVisual = FlowVisual | MermaidVisual;
