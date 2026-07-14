import type { ModuleId, TopicMeta } from "./types";

export const MODULES: { id: ModuleId; label: string; short: string }[] = [
  { id: "core", label: "Core Module", short: "Core" },
  { id: "theoretical", label: "Theoretical CS", short: "Theory" },
  { id: "software", label: "SE & Data Structures", short: "SE/DS" },
  { id: "databases", label: "Database Systems", short: "DB" },
  { id: "networks", label: "Networks & Security", short: "Net/Sec" },
  { id: "os", label: "Operating Systems", short: "OS" },
];

export const TOPICS: TopicMeta[] = [
  // ---- Core Module ----
  { id: "figure-sequences", title: "Figure Sequences", module: "core", tag: "75s/item" },
  { id: "mathematical-equations", title: "Mathematical Equations", module: "core", tag: "75s/item" },
  { id: "latin-squares", title: "Latin Squares", module: "core", tag: "75s/item" },
  // ---- Theoretical CS ----
  { id: "automata-basics", title: "Automata Basics", module: "theoretical", tag: "DFA · PDA · TM" },
  { id: "complexity-classes", title: "Complexity Classes (P/NP)", module: "theoretical", tag: "P · NP · NPC" },
  { id: "big-o-comparison", title: "Big-O Comparison", module: "theoretical", tag: "growth rates" },
  // ---- SE & Data Structures ----
  { id: "oop-design-patterns", title: "OOP Design Patterns", module: "software", tag: "factory · observer" },
  { id: "trees", title: "Trees", module: "software", tag: "BST · balance" },
  { id: "graphs", title: "Graphs", module: "software", tag: "BFS · Dijkstra" },
  { id: "system-architecture", title: "System Architecture", module: "software", tag: "monolith · micro" },
  // ---- Databases ----
  { id: "relational-algebra", title: "Relational Algebra", module: "databases", tag: "σ · π · ⋈" },
  { id: "sql-optimization", title: "SQL Optimization", module: "databases", tag: "indexes · plans" },
  { id: "normalization", title: "Normalization & Transactions", module: "databases", tag: "1NF–3NF · ACID" },
  // ---- Networks & Security ----
  { id: "osi-tcp-ip", title: "OSI & TCP/IP", module: "networks", tag: "layers" },
  { id: "routing-basics", title: "Routing Basics", module: "networks", tag: "DV · LS" },
  { id: "encryption", title: "Encryption & Hashing", module: "networks", tag: "sym · asym · TLS" },
  { id: "security-goals", title: "Security Goals (CIA+A)", module: "networks", tag: "attack mapping" },
  // ---- Operating Systems ----
  { id: "process-sync", title: "Process Synchronization", module: "os", tag: "mutex · semaphore" },
  { id: "memory-management", title: "Memory Management", module: "os", tag: "paging · VM" },
  { id: "deadlocks", title: "Deadlocks", module: "os", tag: "4 conditions" },
];

export const topicById = (id: string) => TOPICS.find((t) => t.id === id);

export const topicsOfModule = (m: ModuleId) => TOPICS.filter((t) => t.module === m);

export function neighbours(id: string): { prev?: TopicMeta; next?: TopicMeta } {
  const i = TOPICS.findIndex((t) => t.id === id);
  if (i === -1) return {};
  return { prev: TOPICS[i - 1], next: TOPICS[i + 1] };
}
