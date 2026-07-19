import type { TopicVisual } from "./types";
import { FIGURE_SEQUENCES_VISUALS } from "./figure-sequences";
import { MATHEMATICAL_EQUATIONS_VISUALS } from "./mathematical-equations";
import { LATIN_SQUARES_VISUALS } from "./latin-squares";
import { AUTOMATA_BASICS_VISUALS } from "./automata-basics";
import { COMPLEXITY_CLASSES_VISUALS } from "./complexity-classes";
import { BIG_O_COMPARISON_VISUALS } from "./big-o-comparison";
import { OOP_DESIGN_PATTERNS_VISUALS } from "./oop-design-patterns";
import { TREES_VISUALS } from "./trees";
import { GRAPHS_VISUALS } from "./graphs";
import { SYSTEM_ARCHITECTURE_VISUALS } from "./system-architecture";
import { RELATIONAL_ALGEBRA_VISUALS } from "./relational-algebra";
import { SQL_OPTIMIZATION_VISUALS } from "./sql-optimization";
import { NORMALIZATION_VISUALS } from "./normalization";
import { OSI_TCP_IP_VISUALS } from "./osi-tcp-ip";
import { ROUTING_BASICS_VISUALS } from "./routing-basics";
import { ENCRYPTION_VISUALS } from "./encryption";
import { SECURITY_GOALS_VISUALS } from "./security-goals";
import { PROCESS_SYNC_VISUALS } from "./process-sync";
import { MEMORY_MANAGEMENT_VISUALS } from "./memory-management";
import { DEADLOCKS_VISUALS } from "./deadlocks";

// Registry keyed by TOPIC ID — every topic has at least one visual.
// Add a src/lib/diagrams/<topic>.ts file and one line here.
export const DIAGRAMS: Record<string, TopicVisual[]> = {
  "figure-sequences": FIGURE_SEQUENCES_VISUALS,
  "mathematical-equations": MATHEMATICAL_EQUATIONS_VISUALS,
  "latin-squares": LATIN_SQUARES_VISUALS,
  "automata-basics": AUTOMATA_BASICS_VISUALS,
  "complexity-classes": COMPLEXITY_CLASSES_VISUALS,
  "big-o-comparison": BIG_O_COMPARISON_VISUALS,
  "oop-design-patterns": OOP_DESIGN_PATTERNS_VISUALS,
  trees: TREES_VISUALS,
  graphs: GRAPHS_VISUALS,
  "system-architecture": SYSTEM_ARCHITECTURE_VISUALS,
  "relational-algebra": RELATIONAL_ALGEBRA_VISUALS,
  "sql-optimization": SQL_OPTIMIZATION_VISUALS,
  normalization: NORMALIZATION_VISUALS,
  "osi-tcp-ip": OSI_TCP_IP_VISUALS,
  "routing-basics": ROUTING_BASICS_VISUALS,
  encryption: ENCRYPTION_VISUALS,
  "security-goals": SECURITY_GOALS_VISUALS,
  "process-sync": PROCESS_SYNC_VISUALS,
  "memory-management": MEMORY_MANAGEMENT_VISUALS,
  deadlocks: DEADLOCKS_VISUALS,
};

export type { TopicVisual, TopicDiagramData } from "./types";
