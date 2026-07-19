// ============================================================
// Shared types for the dMAT portal.
// ============================================================

export type ModuleId =
  | "core"
  | "theoretical"
  | "software"
  | "databases"
  | "networks"
  | "os";

export interface TopicMeta {
  id: string;
  title: string;
  module: ModuleId;
  tag: string; // short mono tag shown next to the title
}

// ---------- Learn-page content ----------
export interface TopicQuestion {
  prompt: string;
  block?: string; // optional mono block (equations, tables, code)
  options: string[];
  answer: number;
  explain: string;
}

// A concrete, step-by-step case walked through before practice.
export interface WorkedExample {
  scenario: string; // the concrete setup (1–2 sentences)
  steps: string[]; // ordered reasoning steps
  result: string; // the payoff / answer line
}

// Optional depth, collapsed by default so the page stays short.
export interface DeepDive {
  title: string;
  body: string;
}

export interface TopicContent {
  id: string;
  whyItMatters?: string; // one line: the real dMAT scenario / job task this unlocks
  intro: string; // one short plain-language paragraph (the mental model)
  analogy?: string; // a vivid, concrete comparison for the core idea
  bullets: string[]; // max ~5 how-it-works bullets
  workedExample?: WorkedExample; // one concrete case, worked step-by-step
  gotchas?: string[]; // common mistakes / "X is NOT Y" contrasts
  quickCheck?: TopicQuestion; // single retrieval question, right after the concept
  deepDive?: DeepDive[]; // optional expandable depth
  recap?: string; // 2-line restatement of the mental model
  related?: string[]; // ids of related topics to cross-link
  // (interactive diagrams live in src/lib/diagrams, keyed by topic id)
  drill?: "figures" | "latin"; // core topics with generated visual drills
  questions: TopicQuestion[];
}

// ---------- Figure sequences ----------
export interface FigSymbol {
  shape: string; // unicode glyph
  color: string;
  rot: number; // degrees
  r: number;
  c: number;
}
export type FigMatrix = FigSymbol[];

export interface FigureItem {
  id: string;
  given: FigMatrix[]; // matrices 1–4
  opts: [FigMatrix[], FigMatrix[]]; // 3 options for matrix 5, 3 for matrix 6
  answer: [number, number];
  rule: string;
}

// ---------- Mathematical equations ----------
export interface MathItem {
  id: string;
  equations: string[];
  options: string[]; // full assignments, e.g. "A = 4, B = 8"
  answer: number;
  solution: string;
}

// ---------- Latin squares ----------
export interface LatinItem {
  id: string;
  grid: (string | null)[][]; // 5×5, null = hidden
  target: [number, number];
  answer: string; // A–E
}

// ---------- Subject module (mock) ----------
export interface SubjectItem {
  passageTitle?: string;
  passage?: string; // shown when it changes from previous question
  prompt: string;
  block?: string;
  options: string[];
  answer: number;
  explain: string;
}

// ---------- Mock exam result ----------
export interface SectionResult {
  id: string;
  title: string;
  total: number;
  correct: number;
  answered: number;
}

export interface MockAttempt {
  startedAt: string;
  finishedAt: string;
  sections: SectionResult[];
  corePct: number;
  subjectPct: number;
  totalPct: number;
}

// ---------- Persisted progress ----------
export interface ProgressState {
  completedTopics: Record<string, string>; // topicId -> ISO date
  lastTopic: string | null;
  topicAnswers: Record<string, Record<number, number>>; // topicId -> qIndex -> chosen
  viewedDiagrams: Record<string, string>; // topicId -> ISO date (soft completion signal)
  mockAttempts: MockAttempt[];
  updatedAt: number;
}

export const EMPTY_PROGRESS: ProgressState = {
  completedTopics: {},
  lastTopic: null,
  topicAnswers: {},
  viewedDiagrams: {},
  mockAttempts: [],
  updatedAt: 0,
};
