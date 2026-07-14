// ============================================================
// Latin Squares generator.
//
// 1. Build a random 5×5 Latin square (cyclic base + shuffled
//    rows/columns/symbols).
// 2. Pick a target cell and hide cells one by one, keeping the
//    puzzle solvable by pure forced deduction (the only reasoning
//    the real test needs). Lower reveal floors = harder items.
// ============================================================
import type { LatinItem } from "../types";
import { mulberry32, randInt, shuffle, type Rng } from "../rng";

const N = 5;
const LETTERS = ["A", "B", "C", "D", "E"];

function buildSquare(rng: Rng): string[][] {
  const rows = shuffle(rng, [0, 1, 2, 3, 4]);
  const cols = shuffle(rng, [0, 1, 2, 3, 4]);
  const syms = shuffle(rng, LETTERS);
  const g: string[][] = [];
  for (let r = 0; r < N; r++) {
    const row: string[] = [];
    for (let c = 0; c < N; c++) row.push(syms[(rows[r] + cols[c]) % N]);
    g.push(row);
  }
  return g;
}

// Forced-deduction solver: naked singles + hidden singles in rows/cols.
// Returns the deduced grid (nulls where nothing is forced).
function deduce(revealed: (string | null)[][]): (string | null)[][] {
  const g = revealed.map((row) => [...row]);
  let changed = true;
  while (changed) {
    changed = false;
    // candidates per cell
    const cand: string[][][] = g.map((row, r) =>
      row.map((cell, c) => {
        if (cell) return [cell];
        const used = new Set<string>();
        for (let i = 0; i < N; i++) {
          if (g[r][i]) used.add(g[r][i]!);
          if (g[i][c]) used.add(g[i][c]!);
        }
        return LETTERS.filter((l) => !used.has(l));
      })
    );
    // naked singles
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++)
        if (!g[r][c] && cand[r][c].length === 1) {
          g[r][c] = cand[r][c][0];
          changed = true;
        }
    // hidden singles per row and column
    for (const letter of LETTERS) {
      for (let r = 0; r < N; r++) {
        if (g[r].includes(letter)) continue;
        const spots = [];
        for (let c = 0; c < N; c++) if (!g[r][c] && cand[r][c].includes(letter)) spots.push(c);
        if (spots.length === 1) {
          g[r][spots[0]] = letter;
          changed = true;
        }
      }
      for (let c = 0; c < N; c++) {
        let present = false;
        const spots = [];
        for (let r = 0; r < N; r++) {
          if (g[r][c] === letter) present = true;
          else if (!g[r][c] && cand[r][c].includes(letter)) spots.push(r);
        }
        if (!present && spots.length === 1) {
          g[spots[0]][c] = letter;
          changed = true;
        }
      }
    }
  }
  return g;
}

export function generateLatinItem(seed: number, difficulty: 0 | 1 | 2): LatinItem {
  const rng = mulberry32(seed);
  const full = buildSquare(rng);
  const tr = randInt(rng, 0, N - 1);
  const tc = randInt(rng, 0, N - 1);
  const floor = difficulty === 0 ? 12 : difficulty === 1 ? 9 : 7;

  // start fully revealed except the target, then greedily hide
  const grid: (string | null)[][] = full.map((row) => [...row]);
  grid[tr][tc] = null;
  let revealedCount = N * N - 1;

  const order = shuffle(
    rng,
    Array.from({ length: N * N }, (_, i) => [Math.floor(i / N), i % N] as [number, number]).filter(
      ([r, c]) => !(r === tr && c === tc)
    )
  );

  for (const [r, c] of order) {
    if (revealedCount <= floor) break;
    const backup = grid[r][c];
    grid[r][c] = null;
    const solved = deduce(grid);
    if (solved[tr][tc] === full[tr][tc]) {
      revealedCount--;
    } else {
      grid[r][c] = backup; // must stay revealed
    }
  }

  return { id: `latin-${seed}`, grid, target: [tr, tc], answer: full[tr][tc] };
}

export function generateLatinSet(baseSeed: number, count: number, difficulties: (0 | 1 | 2)[]): LatinItem[] {
  const items: LatinItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push(generateLatinItem(baseSeed + i, difficulties[Math.min(i, difficulties.length - 1)]));
  }
  return items;
}

export const LATIN_OPTIONS = LETTERS;
