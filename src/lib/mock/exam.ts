// ============================================================
// The single mock exam. Fixed seeds → every attempt is the same
// paper, with real dMAT question counts and per-subtest timing:
//   Figure Sequences        20 items · 25 min
//   Mathematical Equations  20 items · 25 min
//   Latin Squares           16 items · 20 min
//   Break                            · 30 min (skippable)
//   Subject Module (CS)     24 items · 90 min
// No negative marking — guessing and skipping are always allowed.
// ============================================================
import { generateFigureSet } from "../gen/figures";
import { generateMathSet } from "../gen/equations";
import { generateLatinSet } from "../gen/latin";
import { SUBJECT_QUESTIONS } from "./subject";

export type SectionId = "figures" | "equations" | "latin" | "break" | "subject";

export interface SectionDef {
  id: SectionId;
  title: string;
  minutes: number;
  count: number; // 0 for break
  intro: string;
}

export const SECTIONS: SectionDef[] = [
  {
    id: "figures",
    title: "Core · Figure Sequences",
    minutes: 25,
    count: 20,
    intro:
      "20 series. For each, pick what matrix 5 AND matrix 6 look like (both must be correct to score the item). ~75 seconds per item.",
  },
  {
    id: "equations",
    title: "Core · Mathematical Equations",
    minutes: 25,
    count: 20,
    intro:
      "20 systems of equations. Every unknown is an integer from 1–20 with exactly one solution. No paper, no calculator — like the real thing.",
  },
  {
    id: "latin",
    title: "Core · Latin Squares",
    minutes: 20,
    count: 16,
    intro:
      "16 grids. Each letter A–E appears once per row and column. Determine the letter at the question mark.",
  },
  {
    id: "break",
    title: "Break",
    minutes: 30,
    count: 0,
    intro: "The real exam has a 30-minute break between Core and Subject Module. Take it — or skip it.",
  },
  {
    id: "subject",
    title: "Subject Module · Computer Science",
    minutes: 90,
    count: 24,
    intro:
      "24 single-choice questions based on short input texts. Application over recall. Unanswered items score zero — always guess.",
  },
];

const ramp20: (0 | 1 | 2)[] = [
  0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2,
];
const ramp16: (0 | 1 | 2)[] = [
  0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2,
];

// Lazily built once — figure/latin generation does real work.
let cache: {
  figures: ReturnType<typeof generateFigureSet>;
  equations: ReturnType<typeof generateMathSet>;
  latin: ReturnType<typeof generateLatinSet>;
  subject: typeof SUBJECT_QUESTIONS;
} | null = null;

export function getExam() {
  if (!cache) {
    cache = {
      figures: generateFigureSet(20250101, 20, ramp20),
      equations: generateMathSet(20250202, 20, ramp20),
      latin: generateLatinSet(20250303, 16, ramp16),
      subject: SUBJECT_QUESTIONS,
    };
  }
  return cache;
}
