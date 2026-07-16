import type { TopicDiagramData } from "./types";
import { OSI_TCP_IP_DIAGRAM } from "./osi-tcp-ip";
import { TREES_DIAGRAM } from "./trees";
import { DEADLOCKS_DIAGRAM } from "./deadlocks";

// Registry keyed by TopicContent.diagram. Add a new src/lib/diagrams/
// <topic>.ts file and one line here to light up another topic.
export const DIAGRAMS: Record<string, TopicDiagramData> = {
  "osi-tcp-ip": OSI_TCP_IP_DIAGRAM,
  trees: TREES_DIAGRAM,
  deadlocks: DEADLOCKS_DIAGRAM,
};

export type { TopicDiagramData } from "./types";
