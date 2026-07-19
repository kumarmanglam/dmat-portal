import type { TopicVisual } from "./types";

// The producer–consumer system with its three primitives: one mutex
// for mutual exclusion on the buffer, two counting semaphores for
// the "is there room / is there work" bookkeeping. The walkthrough
// first replays the lost-update race, then assembles the fix piece
// by piece so it's clear what each primitive contributes — and what
// breaks without it.
export const PROCESS_SYNC_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Producer–consumer: one mutex, two semaphores",
      flow: "free",
      caption:
        "The canonical synchronisation pattern. Solid arrows = data moving through the buffer; dashed = the permits and lock a thread must hold first. Run the walkthrough to see the race, then watch each primitive close one gap.",
      legend: [
        { swatch: "blue", text: "thread (producer / consumer)" },
        { swatch: "green", text: "mutex — who may touch the buffer" },
        { swatch: "muted", text: "counting semaphore — when a thread may proceed" },
        { swatch: "danger", text: "the race that happens without protection" },
      ],
      nodes: [
        {
          id: "producer",
          label: "Producer thread",
          desc: "makes items, writes into slots",
          detail:
            "Runs a loop: create an item, put it in the buffer. Before every write it must acquire one 'empty slot' permit and the mutex — otherwise it could overwrite unconsumed data or interleave with the consumer mid-update.",
          x: 60,
          y: 100,
          kind: "blue",
        },
        {
          id: "consumer",
          label: "Consumer thread",
          desc: "takes items out of slots",
          detail:
            "Runs the mirror loop: take an item from the buffer, process it. Before every take it must acquire one 'filled slot' permit and the mutex — otherwise it could read an empty slot or tear an update in progress.",
          x: 640,
          y: 100,
          kind: "blue",
        },
        {
          id: "buffer",
          label: "Bounded buffer",
          desc: "[ 5 slots ]",
          detail:
            "The shared state — a fixed array of 5 slots plus an index or count. Shared + written by two threads = danger zone. Every hazard in this diagram is some thread touching this structure at the wrong moment.",
          x: 350,
          y: 250,
          kind: "accent",
        },
        {
          id: "mutex",
          label: "mutex",
          desc: "who may touch the buffer",
          detail:
            "One key, one owner. Whichever thread holds it may modify the buffer; the other blocks at lock() until the key is handed back. It makes the read-modify-write on the slot index indivisible — but it counts nothing.",
          x: 350,
          y: 80,
          kind: "green",
        },
        {
          id: "sem-empty",
          label: "semaphore: empty slots",
          desc: "init = 5",
          detail:
            "A stack of 5 permits, one per free slot. The producer takes one before writing (acquire) and the consumer returns one after taking (release). At 0 the producer sleeps — the buffer is full and writing would destroy data.",
          x: 60,
          y: 400,
          kind: "muted",
        },
        {
          id: "sem-filled",
          label: "semaphore: filled slots",
          desc: "init = 0",
          detail:
            "The mirror image: starts at 0 because nothing is available yet. The producer releases one after each write; the consumer acquires one before each take. At 0 the consumer sleeps — there is nothing to consume.",
          x: 640,
          y: 400,
          kind: "muted",
        },
        {
          id: "race",
          label: "LOST UPDATE",
          desc: "both read 100, both write 150",
          detail:
            "The failure the mutex exists to prevent. Two threads both read the shared value, both compute from the stale copy, and the second write silently erases the first. No error, no crash — just a wrong answer that only appears under the right interleaving.",
          x: 350,
          y: 540,
          kind: "danger",
        },
      ],
      edges: [
        { id: "e-write", from: "producer", to: "buffer", label: "write item" },
        { id: "e-take", from: "buffer", to: "consumer", label: "take item" },
        {
          id: "e-empty",
          from: "producer",
          to: "sem-empty",
          label: "acquire(empty) BEFORE writing",
          dashed: true,
        },
        {
          id: "e-filled",
          from: "consumer",
          to: "sem-filled",
          label: "acquire(filled) BEFORE taking",
          dashed: true,
        },
        {
          id: "e-mutex-p",
          from: "producer",
          to: "mutex",
          label: "lock around the touch",
          dashed: true,
        },
        {
          id: "e-mutex-c",
          from: "consumer",
          to: "mutex",
          label: "lock around the touch",
          dashed: true,
        },
        {
          id: "e-race",
          from: "buffer",
          to: "race",
          label: "without the mutex",
          dashed: true,
        },
      ],
      steps: [
        {
          title: "The cast: two threads, one shared buffer",
          text: "A producer writes items in; a consumer takes items out; between them sits one buffer with 5 slots that BOTH threads read and write. That combination — shared state plus at least one writer — is the precondition for every race condition. Nothing here is dangerous alone; the danger is entirely in the overlap.",
          focus: ["producer", "consumer", "buffer"],
          edgeFocus: ["e-write", "e-take"],
        },
        {
          title: "The race, replayed in slow motion",
          text: "Updating a slot count is secretly three steps: load the value, modify it, store it back. Interleave two threads inside that window — both load 100, both compute 150, both store 150 — and one update simply vanishes, with no error to show for it. The bug is probabilistic: it needs the scheduler to switch threads inside a nanoseconds-wide window, which is exactly why it survives testing and detonates in production.",
          focus: ["race", "buffer"],
          edgeFocus: ["e-race"],
        },
        {
          title: "The mutex closes the window",
          text: "Wrap the load-modify-store in lock()/unlock() and the interleaving becomes impossible: the second thread blocks at lock() until the first has finished its store. Crucially, the lock covers ONLY the buffer touch — not item creation, not item processing. Lock the whole loop and the two threads run one at a time, throwing away the concurrency you built this for.",
          focus: ["mutex", "producer", "consumer"],
          edgeFocus: ["e-mutex-p", "e-mutex-c"],
        },
        {
          title: "But a mutex cannot count",
          text: "Suppose the buffer is full and the producer arrives. The mutex happily lets it in — one thread at a time is the ONLY rule it knows — and the producer overwrites an unconsumed item. 'Is there room?' is a counting question, not an exclusion question, and answering it needs a different primitive entirely.",
          focus: ["mutex", "buffer"],
          edgeFocus: ["e-write"],
        },
        {
          title: "Semaphore 'empty slots': permission to write",
          text: "The empty-slots semaphore starts at 5 — one permit per free slot. The producer must acquire a permit BEFORE writing; each write burns one. When it hits 0 the buffer is full, and the producer doesn't spin or overwrite — it sleeps inside acquire() until the consumer frees a slot and releases a permit back.",
          focus: ["producer", "sem-empty"],
          edgeFocus: ["e-empty"],
        },
        {
          title: "Semaphore 'filled slots': permission to take",
          text: "The filled-slots semaphore is the mirror image, starting at 0 because nothing exists to consume yet. The consumer acquires before taking; the producer releases after writing. The two semaphores pump in opposite directions — every produce converts an 'empty' permit into a 'filled' one, every consume converts it back — so their sum stays 5, exactly the buffer size.",
          focus: ["consumer", "sem-filled"],
          edgeFocus: ["e-filled"],
        },
        {
          title: "The assembled dance",
          text: "Producer: acquire(empty) → lock → write → unlock → release(filled). Consumer: acquire(filled) → lock → take → unlock → release(empty). Remove the mutex and updates get lost; remove 'empty' and a full buffer gets overwritten; remove 'filled' and the consumer reads garbage from empty slots. Each primitive covers a failure the other two cannot see — which is why this exact triple is THE canonical pattern, from thread pools to message queues.",
          focus: ["producer", "consumer", "buffer", "mutex", "sem-empty", "sem-filled"],
          edgeFocus: ["e-write", "e-take", "e-empty", "e-filled", "e-mutex-p", "e-mutex-c"],
        },
      ],
    },
  },
];
