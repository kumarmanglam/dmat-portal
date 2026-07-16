// ============================================================
// Library-agnostic diagram data. Topics reference a diagram by
// id (TopicContent.diagram); <TopicDiagram> adapts this shape to
// whatever renderer we use (currently React Flow). Keeping the
// data decoupled from the library means swapping renderers never
// touches the per-topic definitions in this folder.
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

export interface TopicDiagramData {
  title: string;
  caption?: string; // how to read the diagram (shown above the canvas)
  // "vertical" (default): edges always run bottom → top (trees, layer stacks).
  // "free": edges attach to whichever side faces the target (cycles, meshes).
  flow?: "vertical" | "free";
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
