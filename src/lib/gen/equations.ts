// ============================================================
// Mathematical Equations generator.
//
// Systems are built backwards from a chosen integer solution
// (all unknowns 1–20), so every item is solvable and unique by
// construction. Option distractors are near-miss assignments.
// ============================================================
import type { MathItem } from "../types";
import { mulberry32, pick, randInt, shuffle, type Rng } from "../rng";

interface Built {
  equations: string[];
  vals: Record<string, number>;
  solution: string;
}

const inRange = (...ns: number[]) => ns.every((n) => n >= 1 && n <= 20);

function buildEasy(rng: Rng): Built | null {
  if (rng() < 0.5) {
    // k + A = s ; B − m = A
    const A = randInt(rng, 2, 12);
    const k = randInt(rng, 2, 8);
    const m = randInt(rng, 1, 6);
    const B = A + m;
    if (!inRange(A, B, A + k)) return null;
    return {
      equations: [`${k} + A = ${k + A}`, `B − ${m} = A`],
      vals: { A, B },
      solution: `From the first equation A = ${A}. Then B = A + ${m} = ${B}.`,
    };
  }
  // B ÷ n = A ; B − A = d
  const n = pick(rng, [2, 3, 4]);
  const A = randInt(rng, 2, Math.floor(20 / n));
  const B = n * A;
  if (!inRange(A, B)) return null;
  return {
    equations: [`B ÷ ${n} = A`, `B − A = ${B - A}`],
    vals: { A, B },
    solution: `B = ${n}A, so ${n}A − A = ${B - A} gives A = ${A}, then B = ${B}.`,
  };
}

function buildMedium(rng: Rng): Built | null {
  if (rng() < 0.5) {
    // n × C = A ; A + C = s ; p × A + q × C = B
    const n = pick(rng, [2, 3]);
    const C = randInt(rng, 1, 4);
    const A = n * C;
    const p = pick(rng, [1, 2]);
    const q = pick(rng, [1, 2]);
    const B = p * A + q * C;
    if (!inRange(A, B, C, A + C)) return null;
    return {
      equations: [
        `${n} × C = A`,
        `A + C = ${A + C}`,
        `${p === 1 ? "" : p + " × "}A + ${q === 1 ? "" : q + " × "}C = B`,
      ],
      vals: { A, B, C },
      solution: `Substitute A = ${n}C into the second equation: ${n + 1}C = ${A + C}, so C = ${C}, A = ${A}, B = ${B}.`,
    };
  }
  // s − B = A ; m × A = C ; B ÷ 2 = A  (so B = 2A, s = 3A)
  const A = randInt(rng, 2, 6);
  const B = 2 * A;
  const m = pick(rng, [2, 3]);
  const C = m * A;
  if (!inRange(A, B, C, 3 * A)) return null;
  return {
    equations: [`${3 * A} − B = A`, `${m} × A = C`, `B ÷ 2 = A`],
    vals: { A, B, C },
    solution: `B = 2A from the third equation; ${3 * A} − 2A = A confirms A = ${A}. Then B = ${B}, C = ${C}.`,
  };
}

function buildHard(rng: Rng): Built | null {
  // Like the official samples: one long combined equation + three definitions.
  const B = randInt(rng, 1, 2);
  const cf = randInt(rng, 3, 6); // C = cf × B
  const af = randInt(rng, 2, 5); // A = af × B
  const dAdd = randInt(rng, 3, 9); // D = B + dAdd
  const A = af * B;
  const C = cf * B;
  const D = B + dAdd;
  const total = A - B + C - D;
  if (!inRange(A, B, C, D) || total < 1 || total > 20) return null;
  return {
    equations: [`A − B + C − D = ${total}`, `${cf} × B = C`, `${af} × B = A`, `${dAdd} + B = D`],
    vals: { A, B, C, D },
    solution: `Substitute everything into the first equation: ${af}B − B + ${cf}B − (${dAdd} + B) = ${total} ⇒ ${af - 1 + cf - 1}B = ${total + dAdd} ⇒ B = ${B}. Then A = ${A}, C = ${C}, D = ${D}.`,
  };
}

const fmt = (vals: Record<string, number>) =>
  Object.keys(vals)
    .sort()
    .map((k) => `${k} = ${vals[k]}`)
    .join(",  ");

function makeOptions(rng: Rng, built: Built): { options: string[]; answer: number } | null {
  const keys = Object.keys(built.vals).sort();
  const seen = new Set<string>([fmt(built.vals)]);
  const distractors: string[] = [];
  let guard = 0;
  while (distractors.length < 3 && guard++ < 60) {
    const v = { ...built.vals };
    const mode = randInt(rng, 0, 2);
    if (mode === 0 && keys.length >= 2) {
      // swap two values
      const [k1, k2] = shuffle(rng, keys).slice(0, 2);
      [v[k1], v[k2]] = [v[k2], v[k1]];
    } else {
      // nudge one or two values by ±1/±2
      const ks = shuffle(rng, keys).slice(0, mode === 1 ? 1 : 2);
      for (const k of ks) v[k] = Math.min(20, Math.max(1, v[k] + pick(rng, [-2, -1, 1, 2])));
    }
    const s = fmt(v);
    if (!seen.has(s)) {
      seen.add(s);
      distractors.push(s);
    }
  }
  if (distractors.length < 3) return null;
  const order = shuffle(rng, [0, 1, 2, 3]);
  const all = [fmt(built.vals), ...distractors];
  const options: string[] = [];
  let answer = 0;
  order.forEach((slot, i) => {
    options.push(all[slot]);
    if (slot === 0) answer = i;
  });
  return { options, answer };
}

export function generateMathItem(seed: number, difficulty: 0 | 1 | 2): MathItem | null {
  const rng = mulberry32(seed);
  const built = difficulty === 0 ? buildEasy(rng) : difficulty === 1 ? buildMedium(rng) : buildHard(rng);
  if (!built) return null;
  const o = makeOptions(rng, built);
  if (!o) return null;
  return {
    id: `math-${seed}`,
    equations: built.equations,
    options: o.options,
    answer: o.answer,
    solution: built.solution,
  };
}

export function generateMathSet(baseSeed: number, count: number, difficulties: (0 | 1 | 2)[]): MathItem[] {
  const items: MathItem[] = [];
  let seed = baseSeed;
  let i = 0;
  while (items.length < count && seed < baseSeed + 100000) {
    const item = generateMathItem(seed, difficulties[Math.min(i, difficulties.length - 1)]);
    seed++;
    if (item) {
      items.push(item);
      i++;
    }
  }
  return items;
}
