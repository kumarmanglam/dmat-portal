// ============================================================
// Renders every registered visual for a topic (flow graphs and
// mermaid diagrams, in registry order). This module is the lazy
// entry point: TopicPage imports it via React.lazy, so React
// Flow, mermaid AND all 20 topics' diagram data stay out of the
// initial bundle.
//
// Viewing counts as a soft "explored" progress signal.
// ============================================================
import { useEffect } from "react";
import { DIAGRAMS } from "../lib/diagrams";
import { useProgress } from "../lib/progress";
import { TopicDiagram } from "./TopicDiagram";
import { MermaidDiagram } from "./MermaidDiagram";

export function TopicVisuals({ topicId }: { topicId: string }) {
  const { markDiagramViewed } = useProgress();
  const visuals = DIAGRAMS[topicId] ?? [];

  useEffect(() => {
    if (visuals.length > 0) markDiagramViewed(topicId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  if (visuals.length === 0) return null;

  return (
    <>
      {visuals.map((v, i) =>
        v.kind === "flow" ? (
          <TopicDiagram key={`${topicId}-${i}`} data={v.data} />
        ) : (
          <MermaidDiagram key={`${topicId}-${i}`} visual={v} />
        )
      )}
    </>
  );
}
