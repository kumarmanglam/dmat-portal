"use strict";

// src/lib/rng.ts
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var randInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
var pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// src/lib/gen/figures.ts
var ROWS = 4;
var COLS = 5;
var SHAPES = ["\u25C6", "\u25CF", "\u25A0", "\u25B2", "\u27A4", "\u25D7"];
var COLORS = ["#0f766e", "#b45309", "#be185d", "#1d5a95", "#14181f", "#ca8a04"];
function reflect(p, max) {
  const period = 2 * max;
  const m = (p % period + period) % period;
  return m > max ? period - m : m;
}
var BORDER = (() => {
  const cells = [];
  for (let c = 0; c < COLS; c++) cells.push([0, c]);
  for (let r = 1; r < ROWS; r++) cells.push([r, COLS - 1]);
  for (let c = COLS - 2; c >= 0; c--) cells.push([ROWS - 1, c]);
  for (let r = ROWS - 2; r >= 1; r--) cells.push([r, 0]);
  return cells;
})();
var accel = (t) => t * (t + 1) / 2;
function makeTrack(rng, kind) {
  const pos = [];
  switch (kind) {
    case 0: {
      const c = randInt(rng, 0, COLS - 1);
      const r0 = randInt(rng, 0, ROWS - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) pos.push([reflect(r0 + dir * t, ROWS - 1), c]);
      return { positions: pos, desc: "moves vertically one field at a time, bouncing off the top/bottom border" };
    }
    case 1: {
      const r = randInt(rng, 0, ROWS - 1);
      const c0 = randInt(rng, 0, COLS - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) pos.push([r, reflect(c0 + dir * t, COLS - 1)]);
      return { positions: pos, desc: "moves horizontally one field at a time, bouncing off the left/right border" };
    }
    case 2: {
      const r0 = randInt(rng, 0, ROWS - 1);
      const c0 = randInt(rng, 0, COLS - 1);
      const dr = pick(rng, [1, -1]);
      const dc = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++)
        pos.push([reflect(r0 + dr * t, ROWS - 1), reflect(c0 + dc * t, COLS - 1)]);
      return { positions: pos, desc: "moves diagonally, bouncing off the borders like a ball" };
    }
    case 3: {
      const start = randInt(rng, 0, BORDER.length - 1);
      const step = pick(rng, [1, 2]);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) {
        const i = ((start + dir * step * t) % BORDER.length + BORDER.length) % BORDER.length;
        pos.push(BORDER[i]);
      }
      return {
        positions: pos,
        desc: `walks along the outer border ${dir === 1 ? "clockwise" : "counter-clockwise"} by ${step} field${step > 1 ? "s" : ""} per step`
      };
    }
    default: {
      const start = randInt(rng, 0, BORDER.length - 1);
      const dir = pick(rng, [1, -1]);
      for (let t = 0; t <= 5; t++) {
        const i = ((start + dir * accel(t)) % BORDER.length + BORDER.length) % BORDER.length;
        pos.push(BORDER[i]);
      }
      return {
        positions: pos,
        desc: `walks along the border ${dir === 1 ? "clockwise" : "counter-clockwise"} accelerating by x + 1 (1 field, then 2, then 3 \u2026)`
      };
    }
  }
}
function symbolAt(s2, t) {
  const [r, c] = s2.track.positions[t];
  return { shape: s2.shape, color: s2.colors[t % s2.colors.length], rot: s2.rotStep * t % 360, r, c };
}
var key = (s2) => `${s2.shape}@${s2.r},${s2.c}|${s2.color}|${s2.rot}`;
var matKey = (m) => m.map(key).sort().join(";");
function buildMatrices(symbols) {
  const mats = [];
  for (let t = 0; t <= 5; t++) {
    const m = symbols.map((s2) => symbolAt(s2, t));
    const cells = new Set(m.map((s2) => `${s2.r},${s2.c}`));
    if (cells.size !== m.length) return null;
    mats.push(m);
  }
  return mats;
}
function distract(rng, correct, taken) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const idx = randInt(rng, 0, correct.length - 1);
    const m = correct.map((s3) => ({ ...s3 }));
    const s2 = m[idx];
    const move = pick(rng, [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [-1, -1]
    ]);
    const nr = s2.r + move[0];
    const nc = s2.c + move[1];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    if (m.some((o, i) => i !== idx && o.r === nr && o.c === nc)) continue;
    s2.r = nr;
    s2.c = nc;
    const k = matKey(m);
    if (taken.has(k)) continue;
    taken.add(k);
    return m;
  }
  return null;
}
function buildOptions(rng, correct) {
  const taken = /* @__PURE__ */ new Set([matKey(correct)]);
  const d1 = distract(rng, correct, taken);
  const d2 = distract(rng, correct, taken);
  if (!d1 || !d2) return null;
  const order = shuffle(rng, [0, 1, 2]);
  const opts = [];
  let answer = 0;
  order.forEach((slot, i) => {
    const src = [correct, d1, d2][slot];
    opts.push(src);
    if (slot === 0) answer = i;
  });
  return { opts, answer };
}
function generateFigureItem(seed, difficulty) {
  const rng = mulberry32(seed);
  const nSym = difficulty === 0 ? 1 : difficulty === 1 ? 2 : 3;
  const shapes = shuffle(rng, SHAPES).slice(0, nSym);
  const palette = shuffle(rng, COLORS);
  const symbols = shapes.map((shape, i) => {
    const kinds = difficulty === 0 ? [0, 1, 3] : difficulty === 1 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
    const track = makeTrack(rng, pick(rng, kinds));
    const useColor = difficulty > 0 && rng() < 0.45;
    const useRot = difficulty > 0 && rng() < 0.35 && (shape === "\u25B2" || shape === "\u27A4" || shape === "\u25D7");
    return {
      shape,
      colors: useColor ? [palette[i * 2], palette[i * 2 + 1]] : [palette[i]],
      rotStep: useRot ? pick(rng, [90, -90]) : 0,
      track
    };
  });
  const mats = buildMatrices(symbols);
  if (!mats) return null;
  if (matKey(mats[4]) === matKey(mats[3]) || matKey(mats[5]) === matKey(mats[4])) return null;
  const o5 = buildOptions(rng, mats[4]);
  const o6 = buildOptions(rng, mats[5]);
  if (!o5 || !o6) return null;
  const rule = symbols.map((s2) => {
    const extra = [];
    if (s2.colors.length > 1) extra.push("alternates its colour");
    if (s2.rotStep !== 0) extra.push(`rotates 90\xB0 ${s2.rotStep > 0 ? "clockwise" : "counter-clockwise"} each step`);
    return `The ${s2.shape} ${s2.track.desc}${extra.length ? " and " + extra.join(" and ") : ""}.`;
  }).join(" ");
  return {
    id: `fig-${seed}`,
    given: mats.slice(0, 4),
    opts: [o5.opts, o6.opts],
    answer: [o5.answer, o6.answer],
    rule
  };
}
function generateFigureSet(baseSeed, count, difficulties) {
  const items = [];
  let seed = baseSeed;
  let i = 0;
  while (items.length < count && seed < baseSeed + 1e5) {
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

// src/lib/gen/equations.ts
var inRange = (...ns) => ns.every((n) => n >= 1 && n <= 20);
function buildEasy(rng) {
  if (rng() < 0.5) {
    const A2 = randInt(rng, 2, 12);
    const k = randInt(rng, 2, 8);
    const m = randInt(rng, 1, 6);
    const B2 = A2 + m;
    if (!inRange(A2, B2, A2 + k)) return null;
    return {
      equations: [`${k} + A = ${k + A2}`, `B \u2212 ${m} = A`],
      vals: { A: A2, B: B2 },
      solution: `From the first equation A = ${A2}. Then B = A + ${m} = ${B2}.`
    };
  }
  const n = pick(rng, [2, 3, 4]);
  const A = randInt(rng, 2, Math.floor(20 / n));
  const B = n * A;
  if (!inRange(A, B)) return null;
  return {
    equations: [`B \xF7 ${n} = A`, `B \u2212 A = ${B - A}`],
    vals: { A, B },
    solution: `B = ${n}A, so ${n}A \u2212 A = ${B - A} gives A = ${A}, then B = ${B}.`
  };
}
function buildMedium(rng) {
  if (rng() < 0.5) {
    const n = pick(rng, [2, 3]);
    const C2 = randInt(rng, 1, 4);
    const A2 = n * C2;
    const p = pick(rng, [1, 2]);
    const q = pick(rng, [1, 2]);
    const B2 = p * A2 + q * C2;
    if (!inRange(A2, B2, C2, A2 + C2)) return null;
    return {
      equations: [
        `${n} \xD7 C = A`,
        `A + C = ${A2 + C2}`,
        `${p === 1 ? "" : p + " \xD7 "}A + ${q === 1 ? "" : q + " \xD7 "}C = B`
      ],
      vals: { A: A2, B: B2, C: C2 },
      solution: `Substitute A = ${n}C into the second equation: ${n + 1}C = ${A2 + C2}, so C = ${C2}, A = ${A2}, B = ${B2}.`
    };
  }
  const A = randInt(rng, 2, 6);
  const B = 2 * A;
  const m = pick(rng, [2, 3]);
  const C = m * A;
  if (!inRange(A, B, C, 3 * A)) return null;
  return {
    equations: [`${3 * A} \u2212 B = A`, `${m} \xD7 A = C`, `B \xF7 2 = A`],
    vals: { A, B, C },
    solution: `B = 2A from the third equation; ${3 * A} \u2212 2A = A confirms A = ${A}. Then B = ${B}, C = ${C}.`
  };
}
function buildHard(rng) {
  const B = randInt(rng, 1, 2);
  const cf = randInt(rng, 3, 6);
  const af = randInt(rng, 2, 5);
  const dAdd = randInt(rng, 3, 9);
  const A = af * B;
  const C = cf * B;
  const D = B + dAdd;
  const total = A - B + C - D;
  if (!inRange(A, B, C, D) || total < 1 || total > 20) return null;
  return {
    equations: [`A \u2212 B + C \u2212 D = ${total}`, `${cf} \xD7 B = C`, `${af} \xD7 B = A`, `${dAdd} + B = D`],
    vals: { A, B, C, D },
    solution: `Substitute everything into the first equation: ${af}B \u2212 B + ${cf}B \u2212 (${dAdd} + B) = ${total} \u21D2 ${af - 1 + cf - 1}B = ${total + dAdd} \u21D2 B = ${B}. Then A = ${A}, C = ${C}, D = ${D}.`
  };
}
var fmt = (vals) => Object.keys(vals).sort().map((k) => `${k} = ${vals[k]}`).join(",  ");
function makeOptions(rng, built) {
  const keys = Object.keys(built.vals).sort();
  const seen = /* @__PURE__ */ new Set([fmt(built.vals)]);
  const distractors = [];
  let guard = 0;
  while (distractors.length < 3 && guard++ < 60) {
    const v = { ...built.vals };
    const mode = randInt(rng, 0, 2);
    if (mode === 0 && keys.length >= 2) {
      const [k1, k2] = shuffle(rng, keys).slice(0, 2);
      [v[k1], v[k2]] = [v[k2], v[k1]];
    } else {
      const ks = shuffle(rng, keys).slice(0, mode === 1 ? 1 : 2);
      for (const k of ks) v[k] = Math.min(20, Math.max(1, v[k] + pick(rng, [-2, -1, 1, 2])));
    }
    const s2 = fmt(v);
    if (!seen.has(s2)) {
      seen.add(s2);
      distractors.push(s2);
    }
  }
  if (distractors.length < 3) return null;
  const order = shuffle(rng, [0, 1, 2, 3]);
  const all = [fmt(built.vals), ...distractors];
  const options = [];
  let answer = 0;
  order.forEach((slot, i) => {
    options.push(all[slot]);
    if (slot === 0) answer = i;
  });
  return { options, answer };
}
function generateMathItem(seed, difficulty) {
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
    solution: built.solution
  };
}
function generateMathSet(baseSeed, count, difficulties) {
  const items = [];
  let seed = baseSeed;
  let i = 0;
  while (items.length < count && seed < baseSeed + 1e5) {
    const item = generateMathItem(seed, difficulties[Math.min(i, difficulties.length - 1)]);
    seed++;
    if (item) {
      items.push(item);
      i++;
    }
  }
  return items;
}

// src/lib/gen/latin.ts
var N = 5;
var LETTERS = ["A", "B", "C", "D", "E"];
function buildSquare(rng) {
  const rows = shuffle(rng, [0, 1, 2, 3, 4]);
  const cols = shuffle(rng, [0, 1, 2, 3, 4]);
  const syms = shuffle(rng, LETTERS);
  const g = [];
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let c = 0; c < N; c++) row.push(syms[(rows[r] + cols[c]) % N]);
    g.push(row);
  }
  return g;
}
function deduce(revealed) {
  const g = revealed.map((row) => [...row]);
  let changed = true;
  while (changed) {
    changed = false;
    const cand = g.map(
      (row, r) => row.map((cell, c) => {
        if (cell) return [cell];
        const used = /* @__PURE__ */ new Set();
        for (let i = 0; i < N; i++) {
          if (g[r][i]) used.add(g[r][i]);
          if (g[i][c]) used.add(g[i][c]);
        }
        return LETTERS.filter((l) => !used.has(l));
      })
    );
    for (let r = 0; r < N; r++)
      for (let c = 0; c < N; c++)
        if (!g[r][c] && cand[r][c].length === 1) {
          g[r][c] = cand[r][c][0];
          changed = true;
        }
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
function generateLatinItem(seed, difficulty) {
  const rng = mulberry32(seed);
  const full = buildSquare(rng);
  const tr = randInt(rng, 0, N - 1);
  const tc = randInt(rng, 0, N - 1);
  const floor = difficulty === 0 ? 12 : difficulty === 1 ? 9 : 7;
  const grid = full.map((row) => [...row]);
  grid[tr][tc] = null;
  let revealedCount = N * N - 1;
  const order = shuffle(
    rng,
    Array.from({ length: N * N }, (_, i) => [Math.floor(i / N), i % N]).filter(
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
      grid[r][c] = backup;
    }
  }
  return { id: `latin-${seed}`, grid, target: [tr, tc], answer: full[tr][tc] };
}
function generateLatinSet(baseSeed, count, difficulties) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(generateLatinItem(baseSeed + i, difficulties[Math.min(i, difficulties.length - 1)]));
  }
  return items;
}
var LATIN_OPTIONS = LETTERS;

// src/lib/mock/subject.ts
var SETS = [
  {
    title: "Rate Limiting with Hash Tables",
    passage: "An API gateway limits each client to 100 requests per minute. For every incoming request it looks up the client's counter in a hash table keyed by client ID, increments it, and rejects the request if the limit is exceeded. The table uses chaining for collisions. Counters for one million clients are held in memory; a background job resets all counters every 60 seconds.",
    questions: [
      {
        prompt: "What is the expected time complexity of one counter lookup in a well-dimensioned hash table with chaining?",
        options: ["O(1) on average", "O(log n)", "O(n)", "O(n log n)"],
        answer: 0,
        explain: "With a good hash function and sensible load factor, the expected chain length is constant."
      },
      {
        prompt: "If the hash function mapped ALL client IDs to the same bucket, a lookup would degrade to:",
        options: ["O(n) \u2014 one long chain, effectively a linked list", "O(1) \u2014 hashing is always constant", "O(log n) \u2014 chains are trees", "O(n\xB2)"],
        answer: 0,
        explain: "All entries land in one chain that must be scanned linearly \u2014 the classic hash worst case."
      },
      {
        prompt: "The reset job iterates over all one million entries. Its complexity per run is:",
        options: ["O(n)", "O(1)", "O(n\xB2)", "O(log n)"],
        answer: 0,
        explain: "Touching each of n entries once is linear."
      },
      {
        prompt: "The team considers replacing the hash table with a balanced search tree keyed by client ID. What changes for a single lookup?",
        options: [
          "Expected O(1) becomes guaranteed O(log n)",
          "Nothing \u2014 both are O(1)",
          "Lookups become O(n)",
          "Lookups become impossible without sorting requests"
        ],
        answer: 0,
        explain: "Balanced trees trade the average-case constant lookup for a worst-case logarithmic guarantee."
      },
      {
        prompt: "Two gateway threads increment the SAME client's counter concurrently without synchronisation. The risk is:",
        options: [
          "A lost update \u2014 the counter may increase by 1 instead of 2, letting clients exceed the limit",
          "A deadlock between the two threads",
          "A page fault",
          "An SQL injection"
        ],
        answer: 0,
        explain: "Read-increment-write interleaving can lose one increment \u2014 a race condition on shared state."
      }
    ]
  },
  {
    title: "Notification Service Design",
    passage: "A monolithic e-commerce application is being split. A new notification service must send an email whenever an order is placed, a shipment is dispatched, or a payment fails. The order, shipping and payment components should not know how notifications work. The service keeps a single, shared SMTP connection object that is expensive to create. Which classes create which message formatter (plain-text vs HTML) should be decided by configuration.",
    questions: [
      {
        prompt: "Order, shipping and payment components should trigger notifications without knowing about the notification logic. Which pattern decouples them best?",
        options: [
          "Observer \u2014 components publish events, the notification service subscribes",
          "Singleton \u2014 one component owns all others",
          "Strategy \u2014 components inherit from the notifier",
          "Adapter \u2014 wrap SMTP in HTTP"
        ],
        answer: 0,
        explain: "Publish/subscribe (Observer) lets emitters fire events while remaining ignorant of listeners."
      },
      {
        prompt: "The single expensive SMTP connection object shared across the service matches which pattern?",
        options: ["Singleton", "Factory", "Observer", "Composite"],
        answer: 0,
        explain: "One instance, shared access point \u2014 Singleton (with its usual testing caveats)."
      },
      {
        prompt: "Choosing the formatter implementation (plain-text vs HTML) from configuration at creation time calls for:",
        options: ["A Factory", "A second Singleton", "Deep inheritance", "A global variable per format"],
        answer: 0,
        explain: "Encapsulating 'which concrete class to instantiate' is exactly the Factory pattern's job."
      },
      {
        prompt: "After the split, the notification service is down for an hour while orders continue. Orders succeed but no emails are sent, and the emails are simply lost. Which architectural mechanism prevents this loss without coupling the services back together?",
        options: [
          "A message queue between the services \u2014 events persist until consumed",
          "Merging both services again",
          "Retrying the HTTP call once",
          "A shared in-memory list"
        ],
        answer: 0,
        explain: "Queues buffer events durably, letting the consumer catch up after downtime \u2014 the standard async decoupling tool."
      },
      {
        prompt: "The notification service keeps no per-request state in memory between requests. What operational benefit follows directly?",
        options: [
          "It can be scaled horizontally behind a load balancer \u2014 any instance can serve any request",
          "It no longer needs a database",
          "It becomes immune to crashes",
          "SMTP becomes faster"
        ],
        answer: 0,
        explain: "Statelessness makes instances interchangeable \u2014 the prerequisite for horizontal scaling."
      }
    ]
  },
  {
    title: "Library Database",
    passage: "A library system uses these tables:\n\nBook(bookId, title, authorId)\nAuthor(authorId, name, country)\nLoan(loanId, bookId, memberId, loanDate, returnDate)\nMember(memberId, name, city)\n\nLoans of unreturned books have returnDate = NULL. The system runs a nightly report and several interactive search screens. The Loan table has 20 million rows; searches by memberId are frequent and slow.",
    questions: [
      {
        prompt: "Which relational-algebra expression returns the titles of all books written by authors from 'Chile'?",
        options: [
          "\u03C0_title( Book \u22C8 \u03C3_country='Chile'( Author ) )",
          "\u03C3_title( \u03C0_country='Chile'( Author ) )",
          "\u03C0_country( Book \u22C8 Author )",
          "Book \u222A Author"
        ],
        answer: 0,
        explain: "Filter authors by country, join to their books on authorId, project the title."
      },
      {
        prompt: "The slow member searches on the huge Loan table are best fixed by:",
        options: [
          "Creating an index on Loan(memberId)",
          "Normalising Loan into 3NF",
          "Removing the returnDate column",
          "Rewriting SELECT * as SELECT loanId"
        ],
        answer: 0,
        explain: "The filter column needs an index; 20M-row scans per search are the bottleneck, not the schema shape."
      },
      {
        prompt: "Someone proposes adding authorName directly into Book 'to save a join'. Which problem does this introduce?",
        options: [
          "An update anomaly \u2014 renaming an author must touch every one of their book rows",
          "A deadlock risk",
          "Loss of the primary key",
          "The table would violate 1NF"
        ],
        answer: 0,
        explain: "authorName would depend on authorId, not on bookId \u2014 a transitive dependency (3NF violation) causing update anomalies."
      },
      {
        prompt: "A checkout does: (1) INSERT a Loan row, (2) UPDATE the book's availability flag. To guarantee the database never shows a loaned book as available, the two statements must:",
        options: [
          "Run inside one transaction that commits atomically",
          "Run on two different connections",
          "Be separated by a one-second delay",
          "Be executed as a stored procedure without COMMIT"
        ],
        answer: 0,
        explain: "Atomicity of a single transaction guarantees both effects appear together or not at all."
      },
      {
        prompt: "Which SQL predicate correctly finds currently unreturned loans?",
        options: [
          "WHERE returnDate IS NULL",
          "WHERE returnDate = NULL",
          "WHERE returnDate == 'NULL'",
          "WHERE NOT returnDate"
        ],
        answer: 0,
        explain: "NULL is not a value you can compare with '=' (that yields UNKNOWN) \u2014 SQL requires IS NULL."
      }
    ]
  },
  {
    title: "Remote Office Connectivity",
    passage: "A company connects a branch office to headquarters. Employees use a web ERP over HTTPS, IP telephony for calls, and large nightly file syncs. The branch router learns routes from headquarters via a link-state routing protocol. One morning, users report that the ERP is unreachable, while phone calls between offices still work.",
    questions: [
      {
        prompt: "The nightly file sync must guarantee complete, uncorrupted, ordered delivery. Which transport-layer protocol is required?",
        options: ["TCP", "UDP", "ICMP", "ARP"],
        answer: 0,
        explain: "Reliability, ordering and retransmission are TCP's guarantees; UDP offers none of them."
      },
      {
        prompt: "IP telephony prefers UDP because:",
        options: [
          "Low latency matters more than retransmitting lost packets \u2014 a re-sent voice packet arrives too late to be useful",
          "UDP encrypts audio automatically",
          "TCP cannot carry audio bytes",
          "UDP guarantees ordering"
        ],
        answer: 0,
        explain: "Real-time media tolerates loss but not delay; TCP's retransmissions add exactly the wrong kind of latency."
      },
      {
        prompt: "Since calls (voice, UDP) between offices work but the ERP website (HTTPS, TCP port 443) fails, the network path is evidently up. At which layer(s) should you look FIRST for the fault?",
        options: [
          "Transport/application \u2014 e.g. a firewall rule or the ERP server, not the physical link",
          "Physical layer \u2014 a broken cable",
          "Data-link layer \u2014 MAC addressing",
          "Layer 1 and 2 only"
        ],
        answer: 0,
        explain: "Working cross-office calls prove layers 1\u20133 function; a service-specific failure points above them (port blocked, service down)."
      },
      {
        prompt: "In the link-state protocol the branch router runs, each router:",
        options: [
          "Floods its link information and computes shortest paths on the full topology with Dijkstra",
          "Sends its whole routing table to neighbours every 30 seconds and trusts their claims",
          "Asks a central server for each packet's route",
          "Uses only static routes"
        ],
        answer: 0,
        explain: "That is the link-state model (OSPF-style); periodic table gossip describes distance-vector protocols."
      },
      {
        prompt: "HTTPS protects the ERP traffic between branch and HQ. Which combination does TLS provide here?",
        options: [
          "Confidentiality (encryption), integrity (MACs), and server authenticity (certificate)",
          "Only confidentiality",
          "Only availability",
          "Anonymity of the client's IP address"
        ],
        answer: 0,
        explain: "TLS encrypts, detects tampering, and authenticates the server via its certificate. It does not hide IP addresses."
      }
    ]
  },
  {
    title: "Print Server Under Load",
    passage: "A university print server accepts jobs from hundreds of clients. Worker threads take jobs from a shared queue. Each job needs two resources: the printer lock and the accounting-database lock. Some workers acquire printer-then-database, others database-then-printer. The server machine has 8 GB RAM; during exam week, dozens of large PDF jobs are processed simultaneously and the machine slows to a crawl with constant disk activity.",
    questions: [
      {
        prompt: "Occasionally the server freezes: worker W1 holds the printer lock and waits for the database lock, while W2 holds the database lock and waits for the printer lock. This is:",
        options: [
          "A deadlock \u2014 circular wait between W1 and W2",
          "Starvation of W1",
          "A page fault storm",
          "Priority inversion"
        ],
        answer: 0,
        explain: "Two holders each waiting for the other closes the wait cycle \u2014 with mutual exclusion, hold-and-wait and no preemption all present."
      },
      {
        prompt: "The simplest code change that makes this freeze impossible is:",
        options: [
          "Impose a global acquisition order: every worker locks printer before database (or vice versa) \u2014 always",
          "Add more worker threads",
          "Use a faster database",
          "Increase the thread priority of stuck workers"
        ],
        answer: 0,
        explain: "A fixed lock order eliminates circular wait \u2014 one of the four necessary conditions."
      },
      {
        prompt: "The exam-week slowdown (little CPU work, constant disk I/O, worse with more concurrent jobs) is best explained by:",
        options: [
          "Thrashing \u2014 the combined working set of all jobs exceeds RAM, so the OS pages continuously",
          "A deadlock on the printer lock",
          "TLB corruption",
          "The scheduler using round-robin"
        ],
        answer: 0,
        explain: "Overcommitted memory turns runtime into page-swapping. Limiting concurrent jobs or adding RAM fixes it."
      },
      {
        prompt: "The shared job queue is a bounded buffer. Which synchronisation setup is the textbook solution for its producers (clients) and consumers (workers)?",
        options: [
          "Two counting semaphores (free slots, filled slots) plus a mutex for the queue operations",
          "One boolean flag checked in a busy loop",
          "A single counting semaphore only",
          "No synchronisation \u2014 queues are thread-safe by nature"
        ],
        answer: 0,
        explain: "Semaphores handle blocking when full/empty; the mutex protects the queue's internal state during push/pop."
      }
    ]
  }
];
var SUBJECT_QUESTIONS = SETS.flatMap(
  (set) => set.questions.map((q) => ({
    ...q,
    passageTitle: set.title,
    passage: set.passage
    // renderer shows the input text with every question of the set
  }))
);

// scripts/verify-gen.ts
var fails = 0;
var check = (cond, msg) => {
  if (!cond) {
    fails++;
    console.error("FAIL:", msg);
  }
};
var ramp20 = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2];
var figs = generateFigureSet(20250101, 20, ramp20);
check(figs.length === 20, `figures count ${figs.length}`);
for (const f of figs) {
  check(f.given.length === 4, `${f.id} given count`);
  check(f.opts[0].length === 3 && f.opts[1].length === 3, `${f.id} option counts`);
  check(f.answer[0] >= 0 && f.answer[0] < 3 && f.answer[1] >= 0 && f.answer[1] < 3, `${f.id} answer range`);
  for (const mats of [f.given, f.opts[0], f.opts[1]]) {
    for (const m of mats) {
      for (const s2 of m) {
        check(s2.r >= 0 && s2.r < ROWS && s2.c >= 0 && s2.c < COLS, `${f.id} symbol out of grid`);
      }
      const cells = new Set(m.map((s2) => `${s2.r},${s2.c}`));
      check(cells.size === m.length, `${f.id} overlap`);
    }
  }
  for (const slot of [0, 1]) {
    const ser = (i) => JSON.stringify([...f.opts[slot][i]].sort((a, b) => a.r - b.r || a.c - b.c));
    const correct = ser(f.answer[slot]);
    for (let i = 0; i < 3; i++) {
      if (i !== f.answer[slot]) check(ser(i) !== correct, `${f.id} duplicate option slot ${slot}`);
    }
  }
}
var drillFigs = generateFigureSet(777001, 4, [0, 0, 1, 2]);
check(drillFigs.length === 4, "drill figures count");
check(!figs.some((f) => drillFigs.some((d) => d.id === f.id)), "drill/mock figure seed overlap");
var eqs = generateMathSet(20250202, 20, ramp20);
check(eqs.length === 20, `equations count ${eqs.length}`);
for (const e of eqs) {
  check(e.options.length === 4, `${e.id} options`);
  check(new Set(e.options).size === 4, `${e.id} duplicate options`);
  check(e.answer >= 0 && e.answer < 4, `${e.id} answer range`);
  const assign = {};
  for (const part of e.options[e.answer].split(",")) {
    const m = part.trim().match(/^([A-D]) = (\d+)$/);
    check(Boolean(m), `${e.id} option format "${part.trim()}"`);
    if (m) assign[m[1]] = Number(m[2]);
  }
  for (const [k, v] of Object.entries(assign)) check(v >= 1 && v <= 20, `${e.id} ${k}=${v} out of 1..20`);
  for (const eq of e.equations) {
    const [lhs, rhs] = eq.split("=").map((s2) => s2.trim());
    const evalSide = (s) => {
      const expr = s.replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/").replace(/([A-D])/g, (l) => String(assign[l]));
      return eval(expr);
    };
    check(Math.abs(evalSide(lhs) - evalSide(rhs)) < 1e-9, `${e.id} equation "${eq}" not satisfied by ${e.options[e.answer]}`);
  }
}
var ramp16 = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];
var lats = generateLatinSet(20250303, 16, ramp16);
check(lats.length === 16, `latin count ${lats.length}`);
for (const l of lats) {
  check(LATIN_OPTIONS.includes(l.answer), `${l.id} answer letter`);
  const [tr, tc] = l.target;
  check(l.grid[tr][tc] === null, `${l.id} target not hidden`);
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
check(SUBJECT_QUESTIONS.length === 24, `subject count ${SUBJECT_QUESTIONS.length}`);
for (const q of SUBJECT_QUESTIONS) {
  check(q.options.length === 4, `subject options: ${q.prompt.slice(0, 40)}`);
  check(q.answer >= 0 && q.answer < 4, `subject answer range`);
}
console.log(fails === 0 ? "ALL CHECKS PASSED \u2713  (20 fig / 20 eq / 16 latin / 24 subject)" : `${fails} FAILURES`);
process.exit(fails === 0 ? 0 : 1);
