import type { TopicVisual } from "./types";

// The address-translation journey: virtual address → TLB → page
// table → frame (or page fault → disk → eviction).
export const MEMORY_MANAGEMENT_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "One memory access, start to finish",
      flow: "free",
      caption:
        "Process P1 touches a virtual address. Follow the walkthrough through the TLB, the page table, RAM frames — and the page-fault detour through disk.",
      legend: [
        { swatch: "blue", text: "the process and its virtual address" },
        { swatch: "accent", text: "translation machinery (TLB, page table, OS)" },
        { swatch: "green", text: "P1's pages resident in RAM" },
        { swatch: "danger", text: "disk — the slow path" },
      ],
      nodes: [
        {
          id: "proc",
          label: "Process P1",
          desc: "reads virtual addr 0x4A2F",
          detail:
            "P1 believes it owns a private address space starting at 0 — every process believes the same lie. The address it uses is virtual; hardware+OS translate it on EVERY access.",
          x: 320,
          y: 10,
          kind: "blue",
        },
        {
          id: "tlb",
          label: "TLB",
          desc: "cache of recent translations",
          detail:
            "A tiny, very fast cache of recently used page→frame mappings. Hit: translation is free. Miss: walk the page table. Without a TLB every single memory access would pay for extra memory lookups just to find itself.",
          x: 80,
          y: 150,
          kind: "accent",
        },
        {
          id: "pt",
          label: "Page table",
          desc: "P1's page → frame map",
          detail:
            "The OS-maintained map from P1's virtual pages to physical frames. Fixed-size pages/frames mean ANY free frame can hold ANY page — that uniformity is what eliminates external fragmentation.",
          x: 560,
          y: 150,
          kind: "accent",
        },
        {
          id: "f0",
          label: "Frame 0",
          desc: "P1 · page 3",
          detail:
            "A resident page of P1. Under LRU it's also a potential eviction victim — whichever resident page has gone unused the longest gets kicked when a frame is needed.",
          x: 40,
          y: 330,
          kind: "green",
        },
        {
          id: "f1",
          label: "Frame 1",
          desc: "P2 · page 0",
          detail:
            "Belongs to a DIFFERENT process. Frames hold pages from many processes at once; the page tables keep them from ever seeing each other's memory — isolation falls out of translation.",
          x: 280,
          y: 330,
          kind: "muted",
        },
        {
          id: "f2",
          label: "Frame 2",
          desc: "P1 · page 7 ✓ target",
          detail:
            "The frame that actually holds the page containing 0x4A2F. After translation, the physical access proceeds — P1 never learns which frame it was, or that a translation happened at all.",
          x: 520,
          y: 330,
          kind: "green",
        },
        {
          id: "f3",
          label: "Frame 3",
          desc: "free",
          detail:
            "A free frame — the page-fault handler's first choice for loading an incoming page. Only when no frame is free does eviction (and the LRU bet) come into play.",
          x: 740,
          y: 330,
          kind: "muted",
        },
        {
          id: "fault",
          label: "Page fault handler",
          desc: "OS trap — not a crash",
          detail:
            "Runs when the page table says 'not in RAM'. It finds the page on disk, picks a frame (free one, else evict LRU victim), loads the page, fixes the page table, and resumes the instruction as if nothing happened. Routine, invisible — except in latency.",
          x: 560,
          y: 480,
          kind: "accent",
        },
        {
          id: "disk",
          label: "Disk (swap)",
          desc: "evicted pages live here",
          detail:
            "~100,000× slower than RAM. Fine as a rare backstop; fatal as a habit — when working sets exceed RAM and every process faults constantly, the machine thrashes: disk screams, CPU idles.",
          x: 240,
          y: 560,
          kind: "danger",
        },
      ],
      edges: [
        { id: "m1", from: "proc", to: "tlb", label: "1 · check TLB first" },
        { id: "m2", from: "tlb", to: "pt", label: "2 · miss → walk table", dashed: true },
        { id: "m3", from: "pt", to: "f2", label: "3 · page 7 → frame 2" },
        { id: "m4", from: "pt", to: "fault", label: "not in RAM → FAULT", dashed: true, animated: true },
        { id: "m5", from: "fault", to: "disk", label: "read page in" },
        { id: "m6", from: "disk", to: "f3", label: "load into free frame", dashed: true },
        { id: "m7", from: "fault", to: "f0", label: "no free frame? evict LRU", dashed: true },
      ],
      steps: [
        {
          title: "The comfortable lie",
          text: "P1 reads address 0x4A2F in ITS private address space — which doesn't physically exist. Every process gets the same illusion (own space, starts at 0), which is what lets the OS place, move and evict memory freely, and what stops P1 from ever addressing P2's data. Translation happens on every single access, so it had better be fast.",
          focus: ["proc"],
        },
        {
          title: "TLB first — making the lie affordable",
          text: "The hardware checks the TLB, a tiny cache of recent page→frame translations. Programs touch the same pages repeatedly (locality), so hit rates run ~99% — the illusion usually costs nothing. Without it, EVERY access would pay extra lookups just to find its own bytes: virtual memory would be unusably slow.",
          focus: ["proc", "tlb"],
          edgeFocus: ["m1"],
        },
        {
          title: "TLB miss — walk the page table",
          text: "On a miss, the page table (the OS's full map for P1) answers instead. Note what fixed sizes buy here: pages and frames are the same size, so ANY free frame fits ANY page — free memory is always usable, external fragmentation can't exist. The cost is internal: the unused tail of a process's last page.",
          focus: ["tlb", "pt"],
          edgeFocus: ["m2"],
        },
        {
          title: "The happy path: frame 2",
          text: "Page 7 is resident in frame 2 — translate, access, cache the mapping in the TLB, done. Notice frame 1 holds a page of a DIFFERENT process: RAM interleaves everyone's pages, and only the per-process page table keeps them apart. Isolation isn't a separate mechanism; it falls out of translation.",
          focus: ["pt", "f2", "f1"],
          edgeFocus: ["m3"],
        },
        {
          title: "The other path: page fault",
          text: "If the table says 'not in RAM', the CPU traps to the OS — a page fault. This is NOT an error (that's a segmentation fault, an illegal address). Demand paging means pages load only when first touched, so faults are the system working as designed. The process just stalls a moment and resumes, unaware.",
          focus: ["pt", "fault"],
          edgeFocus: ["m4"],
        },
        {
          title: "Disk, free frames, and the LRU bet",
          text: "The handler reads the page from disk into a free frame (frame 3). No free frame? Evict the least-recently-used resident page — a bet that the recent past predicts the near future, and the reason reference-string questions (1,2,3,1,4 → who gets evicted?) appear on the exam. Disk is ~100,000× slower than RAM, so this path must stay rare.",
          focus: ["fault", "disk", "f3", "f0"],
          edgeFocus: ["m5", "m6", "m7"],
        },
        {
          title: "When it all collapses: thrashing",
          text: "If the working sets of all running processes exceed physical RAM, every process faults constantly: CPU utilisation falls while the disk runs flat out, and adding MORE processes makes it worse — the classic exam signature. No scheduler tune fixes it; only more RAM or fewer processes shrink the demand back under supply.",
          focus: ["disk", "proc"],
        },
      ],
    },
  },
];
