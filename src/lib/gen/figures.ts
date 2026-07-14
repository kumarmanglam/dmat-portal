// ============================================================
// Figure Sequences generator.
//
// Each symbol is an independent "machine": it has a movement
// rule (bounce / border walk / diagonal / accelerating) plus an
// optional appearance rule (colour cycle / rotation). We simulate
// t = 0..5 — matrices 1–4 are shown, 5 and 6 are asked. Distractors
// mutate exactly one symbol of the correct answer.
// ============================================================
import type { FigMatrix, FigSymbol, FigureItem } from "../types";
import { mulberry32, pick, randInt, shuffle, type Rng } from "../rng";

export const ROWS = 4;
export const COLS = 5;

const SHAPES = ["◆", "●", "■", "▲", "➤", "◗"];
const COLORS = ["#0f766e", "#b45309", "#be185d", "#1d5a95", "#14181f", "#ca8a04"];

// Bounce reflection: position p folded into [0, max] like a ball.
function reflect(p: number, max: number): number {
  const period = 2 * max;
  const m = ((p % period) + period) % period;
  return m > max ? period - m : m;
}

// Border cells clockwise starting at top-left. 14 cells for a 4×5 grid.
const BORDER: [number, number][] = (() => {
  const cells: [number, number][] = [];
  for (let c = 0; c < COLS; c++) cells.push([0, c]);
  for (let r = 1; r < ROWS; r++) cells.push([r, COLS - 1]);
  for (let c = COLS - 2; c >= 0; c--) cells.push([ROWS - 1, c]);
  for (let r = ROWS - 2; r >= 1; r--) cells.push([r, 0]);
  return cells;
})();

type Track = { positions: [number, number][]; desc: string };

// Cumulative accelerating steps: 1, 2, 3 ... (x + 1 rule)
const accel = (t: number) => (t * (t + 1)) / 2;

function makeTrack(rng: Rng, kind: number): Track {
  const pos: [number, number][] = [];
  switch (kind) {
    case 0: {
      // vertical bounce in a fixed column
      const c = randInt(rng, 0, COLS - 1);
      const r0 = randInt(rng, 0, ROWS - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) pos.push([reflect(r0 + dir * t, ROWS - 1), c]);
      return { positions: pos, desc: "moves vertically one field at a time, bouncing off the top/bottom border" };
    }
    case 1: {
      // horizontal bounce in a fixed row
      const r = randInt(rng, 0, ROWS - 1);
      const c0 = randInt(rng, 0, COLS - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) pos.push([r, reflect(c0 + dir * t, COLS - 1)]);
      return { positions: pos, desc: "moves horizontally one field at a time, bouncing off the left/right border" };
    }
    case 2: {
      // diagonal billiard bounce
      const r0 = randInt(rng, 0, ROWS - 1);
      const c0 = randInt(rng, 0, COLS - 1);
      const dr = pick(rng, [1, -1]);
      const dc = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++)
        pos.push([reflect(r0 + dr * t, ROWS - 1), reflect(c0 + dc * t, COLS - 1)]);
      return { positions: pos, desc: "moves diagonally, bouncing off the borders like a ball" };
    }
    case 3: {
      // border walk, constant step
      const start = randInt(rng, 0, BORDER.length - 1);
      const step = pick(rng, [1, 2]);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) {
        const i = (((start + dir * step * t) % BORDER.length) + BORDER.length) % BORDER.length;
        pos.push(BORDER[i]);
      }
      return {
        positions: pos,
        desc: `walks along the outer border ${dir === 1 ? "clockwise" : "counter-clockwise"} by ${step} field${step > 1 ? "s" : ""} per step`,
      };
    }
    default: {
      // border walk with x + 1 acceleration
      const start = randInt(rng, 0, BORDER.length - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) {
        const i = (((start + dir * accel(t)) % BORDER.length) + BORDER.length) % BORDER.length;
        pos.push(BORDER[i]);
      }
      return {
        positions: pos,
        desc: `walks along the border ${dir === 1 ? "clockwise" : "counter-clockwise"} accelerating by x + 1 (1 field, then 2, then 3 …)`,
      };
    }
  }
}

interface SimSymbol {
  shape: string;
  colors: string[]; // colour cycle (length 1 = constant)
  rotStep: number; // degrees added per step
  track: Track;
}

function symbolAt(s: SimSymbol, t: number): FigSymbol {
  const [r, c] = s.track.positions[t];
  return { shape: s.shape, color: s.colors[t % s.colors.length], rot: (s.rotStep * t) % 360, r, c };
}

const key = (s: FigSymbol) => `${s.shape}@${s.r},${s.c}|${s.color}|${s.rot}`;
const matKey = (m: FigMatrix) => m.map(key).sort().join(";");

function buildMatrices(symbols: SimSymbol[]): FigMatrix[] | null {
  const mats: FigMatrix[] = [];
  for (let t = 0; t <= 5; t++) {
    const m = symbols.map((s) => symbolAt(s, t));
    // symbols may never overlap
    const cells = new Set(m.map((s) => `${s.r},${s.c}`));
    if (cells.size !== m.length) return null;
    mats.push(m);
  }
  return mats;
}

// A distractor = correct matrix with ONE symbol nudged to a wrong cell.
function distract(rng: Rng, correct: FigMatrix, taken: Set<string>): FigMatrix | null {
  for (let attempt = 0; attempt < 30; attempt++) {
    const idx = randInt(rng, 0, correct.length - 1);
    const m = correct.map((s) => ({ ...s }));
    const s = m[idx];
    const move = pick(rng, [
      [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1],
    ]);
    const nr = s.r + move[0];
    const nc = s.c + move[1];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    if (m.some((o, i) => i !== idx && o.r === nr && o.c === nc)) continue;
    s.r = nr;
    s.c = nc;
    const k = matKey(m);
    if (taken.has(k)) continue;
    taken.add(k);
    return m;
  }
  return null;
}

function buildOptions(rng: Rng, correct: FigMatrix): { opts: FigMatrix[]; answer: number } | null {
  const taken = new Set<string>([matKey(correct)]);
  const d1 = distract(rng, correct, taken);
  const d2 = distract(rng, correct, taken);
  if (!d1 || !d2) return null;
  const order = shuffle(rng, [0, 1, 2]);
  const opts: FigMatrix[] = [];
  let answer = 0;
  order.forEach((slot, i) => {
    const src = [correct, d1, d2][slot];
    opts.push(src);
    if (slot === 0) answer = i;
  });
  return { opts, answer };
}

export function generateFigureItem(seed: number, difficulty: 0 | 1 | 2): FigureItem | null {
  const rng = mulberry32(seed);
  const nSym = difficulty === 0 ? 1 : difficulty === 1 ? 2 : 3;
  const shapes = shuffle(rng, SHAPES).slice(0, nSym);
  const palette = shuffle(rng, COLORS);

  const symbols: SimSymbol[] = shapes.map((shape, i) => {
    const kinds = difficulty === 0 ? [0, 1, 3] : difficulty === 1 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
    const track = makeTrack(rng, pick(rng, kinds));
    const useColor = difficulty > 0 && rng() < 0.45;
    const useRot = difficulty > 0 && rng() < 0.35 && (shape === "▲" || shape === "➤" || shape === "◗");
    return {
      shape,
      colors: useColor ? [palette[i * 2], palette[i * 2 + 1]] : [palette[i]],
      rotStep: useRot ? pick(rng, [90, -90]) : 0,
      track,
    };
  });

  const mats = buildMatrices(symbols);
  if (!mats) return null;
  // Reject sequences where matrix 5 or 6 equals matrix 4 (too ambiguous vs distractors)
  if (matKey(mats[4]) === matKey(mats[3]) || matKey(mats[5]) === matKey(mats[4])) return null;

  const o5 = buildOptions(rng, mats[4]);
  const o6 = buildOptions(rng, mats[5]);
  if (!o5 || !o6) return null;

  const rule = symbols
    .map((s) => {
      const extra: string[] = [];
      if (s.colors.length > 1) extra.push("alternates its colour");
      if (s.rotStep !== 0) extra.push(`rotates 90° ${s.rotStep > 0 ? "clockwise" : "counter-clockwise"} each step`);
      return `The ${s.shape} ${s.track.desc}${extra.length ? " and " + extra.join(" and ") : ""}.`;
    })
    .join(" ");

  return {
    id: `fig-${seed}`,
    given: mats.slice(0, 4),
    opts: [o5.opts, o6.opts],
    answer: [o5.answer, o6.answer],
    rule,
  };
}

// Deterministic set: retry seeds until `count` valid items exist.
export function generateFigureSet(baseSeed: number, count: number, difficulties: (0 | 1 | 2)[]): FigureItem[] {
  const items: FigureItem[] = [];
  let seed = baseSeed;
  let i = 0;
  while (items.length < count && seed < baseSeed + 100000) {
    const d = difficulties[Math.min(i, difficulties.length - 1)];
    const item = generateFigureItem(seed, d);
    seed++;
    if (item) {
      items.push(item);
      i++;
    }
  }
  return items;
}
