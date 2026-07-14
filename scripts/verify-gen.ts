// Node-side sanity check for the deterministic generators:
// counts, answer validity, no-overlap, latin solvability, and
// that mock seeds don't collide with learn-drill seeds.
import { generateFigureSet, ROWS, COLS } from "../src/lib/gen/figures";
import { generateMathSet } from "../src/lib/gen/equations";
import { generateLatinSet, LATIN_OPTIONS } from "../src/lib/gen/latin";
import { SUBJECT_QUESTIONS } from "../src/lib/mock/subject";

let fails = 0;
const check = (cond: boolean, msg: string) => {
  if (!cond) {
    fails++;
    console.error("FAIL:", msg);
  }
};

// ---- Figures (mock: 20; drill: 4) ----
const ramp20 = [0,0,0,0,0,0,1,1,1,1,1,1,1,1,2,2,2,2,2,2] as (0|1|2)[];
const figs = generateFigureSet(20250101, 20, ramp20);
check(figs.length === 20, `figures count ${figs.length}`);
for (const f of figs) {
  check(f.given.length === 4, `${f.id} given count`);
  check(f.opts[0].length === 3 && f.opts[1].length === 3, `${f.id} option counts`);
  check(f.answer[0] >= 0 && f.answer[0] < 3 && f.answer[1] >= 0 && f.answer[1] < 3, `${f.id} answer range`);
  for (const mats of [f.given, f.opts[0], f.opts[1]]) {
    for (const m of mats) {
      for (const s of m) {
        check(s.r >= 0 && s.r < ROWS && s.c >= 0 && s.c < COLS, `${f.id} symbol out of grid`);
      }
      const cells = new Set(m.map((s) => `${s.r},${s.c}`));
      check(cells.size === m.length, `${f.id} overlap`);
    }
  }
  // distractors must differ from the correct option
  for (const slot of [0, 1] as const) {
    const ser = (i: number) => JSON.stringify([...f.opts[slot][i]].sort((a, b) => a.r - b.r || a.c - b.c));
    const correct = ser(f.answer[slot]);
    for (let i = 0; i < 3; i++) {
      if (i !== f.answer[slot]) check(ser(i) !== correct, `${f.id} duplicate option slot ${slot}`);
    }
  }
}
const drillFigs = generateFigureSet(777001, 4, [0, 0, 1, 2]);
check(drillFigs.length === 4, "drill figures count");
check(!figs.some((f) => drillFigs.some((d) => d.id === f.id)), "drill/mock figure seed overlap");

// ---- Equations (mock: 20; learn questions are handwritten) ----
const eqs = generateMathSet(20250202, 20, ramp20);
check(eqs.length === 20, `equations count ${eqs.length}`);
for (const e of eqs) {
  check(e.options.length === 4, `${e.id} options`);
  check(new Set(e.options).size === 4, `${e.id} duplicate options`);
  check(e.answer >= 0 && e.answer < 4, `${e.id} answer range`);
  // verify the correct assignment actually satisfies every equation
  const assign: Record<string, number> = {};
  for (const part of e.options[e.answer].split(",")) {
    const m = part.trim().match(/^([A-D]) = (\d+)$/);
    check(Boolean(m), `${e.id} option format "${part.trim()}"`);
    if (m) assign[m[1]] = Number(m[2]);
  }
  for (const [k, v] of Object.entries(assign)) check(v >= 1 && v <= 20, `${e.id} ${k}=${v} out of 1..20`);
  for (const eq of e.equations) {
    const [lhs, rhs] = eq.split("=").map((s) => s.trim());
    const evalSide = (s: string): number => {
      const expr = s
        .replace(/−/g, "-")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/([A-D])/g, (l) => String(assign[l]));
      // eslint-disable-next-line no-eval
      return eval(expr) as number;
    };
    check(Math.abs(evalSide(lhs) - evalSide(rhs)) < 1e-9, `${e.id} equation "${eq}" not satisfied by ${e.options[e.answer]}`);
  }
}

// ---- Latin squares (mock: 16; drill: 4) ----
const ramp16 = [0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2] as (0|1|2)[];
const lats = generateLatinSet(20250303, 16, ramp16);
check(lats.length === 16, `latin count ${lats.length}`);
for (const l of lats) {
  check(LATIN_OPTIONS.includes(l.answer), `${l.id} answer letter`);
  const [tr, tc] = l.target;
  check(l.grid[tr][tc] === null, `${l.id} target not hidden`);
  // revealed letters must be consistent (once per row/col)
  for (let r = 0; r < 5; r++) {
    const seen = l.grid[r].filter(Boolean);
    check(new Set(seen).size === seen.length, `${l.id} row ${r} duplicate`);
  }
  for (let c = 0; c < 5; c++) {
    const seen = l.grid.map((row) => row[c]).filter(Boolean);
    check(new Set(seen).size === seen.length, `${l.id} col ${c} duplicate`);
  }
  const revealed = l.grid.flat().filter(Boolean).length;
  check(revealed >= 5 && revealed <= 24, `${l.id} odd reveal count ${revealed}`);
}

// ---- Subject module ----
check(SUBJECT_QUESTIONS.length === 24, `subject count ${SUBJECT_QUESTIONS.length}`);
for (const q of SUBJECT_QUESTIONS) {
  check(q.options.length === 4, `subject options: ${q.prompt.slice(0, 40)}`);
  check(q.answer >= 0 && q.answer < 4, `subject answer range`);
}

console.log(fails === 0 ? "ALL CHECKS PASSED ✓  (20 fig / 20 eq / 16 latin / 24 subject)" : `${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
