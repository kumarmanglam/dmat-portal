import type { TopicVisual } from "./types";

// A router with two overlapping routes to the same destination —
// the walkthrough resolves the overlap with longest-prefix match,
// then steps back to ask HOW the table got filled in the first
// place: distance-vector gossip vs link-state flooding + Dijkstra.
export const ROUTING_BASICS_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Longest-prefix match — and how the table got there",
      flow: "free",
      caption:
        "A packet for 10.1.2.77 arrives at your router, whose table holds TWO routes that both match. Run the walkthrough to watch specificity win — then meet the two philosophies that fill routing tables in the first place.",
      legend: [
        { swatch: "accent", text: "the router making a local decision" },
        { swatch: "green", text: "most specific route — the winner" },
        { swatch: "blue", text: "the packet's destination" },
        { swatch: "muted", text: "how tables get filled (two philosophies)" },
      ],
      nodes: [
        {
          id: "router",
          label: "Your router",
          desc: "table: /8 → A · /24 → B",
          detail:
            "Its routing table: 10.0.0.0/8 → Hop A and 10.1.2.0/24 → Hop B. Each entry stores only a destination prefix and a NEXT HOP — never the full path. For every arriving packet it compares the destination against every prefix and forwards to the hop of the most specific match.",
          x: 60,
          y: 250,
          kind: "accent",
        },
        {
          id: "hop-a",
          label: "Hop A",
          desc: "route: 10.0.0.0/8",
          detail:
            "The next hop for the broad /8 route, which covers every address beginning with '10.' — about 16.7 million of them. Broad prefixes like this act as catch-alls; more specific prefixes carve exceptions out of them.",
          x: 340,
          y: 80,
        },
        {
          id: "hop-b",
          label: "Hop B",
          desc: "route: 10.1.2.0/24",
          detail:
            "The next hop for the narrow /24 route, covering only the 256 addresses of 10.1.2.x. Because it pins 24 bits of the destination instead of 8, it is the more specific claim — and specificity is exactly what longest-prefix match rewards.",
          x: 340,
          y: 420,
          kind: "green",
        },
        {
          id: "dest",
          label: "10.1.2.77",
          desc: "the packet's destination",
          detail:
            "The host the packet is trying to reach. Its address falls inside BOTH advertised prefixes — inside 10.0.0.0/8 (first 8 bits agree) and inside 10.1.2.0/24 (first 24 bits agree) — so the router must break the tie.",
          x: 640,
          y: 250,
          kind: "blue",
        },
        {
          id: "dv",
          label: "DV router",
          desc: "gossips distance tables",
          detail:
            "Distance-vector philosophy (e.g. RIP): periodically send each neighbour your whole distance table and trust the totals you hear back. Cheap and simple, but rumours propagate slowly, and a stale route echoed back can increment forever — count-to-infinity. RIP caps 'infinity' at 16 hops just to bound the damage.",
          x: 100,
          y: 540,
          kind: "muted",
        },
        {
          id: "ls",
          label: "LS router",
          desc: "floods link states, runs Dijkstra on the full map",
          detail:
            "Link-state philosophy (e.g. OSPF): flood raw facts — 'my link to X costs 2' — to every router, so each one assembles the SAME complete map and runs Dijkstra locally. Convergence after a failure is fast because nobody waits on second-hand conclusions; the price is memory and CPU for holding the whole topology.",
          x: 420,
          y: 540,
          kind: "muted",
        },
      ],
      edges: [
        { id: "m8", from: "router", to: "hop-a", label: "/8 match (8 bits)" },
        {
          id: "m24",
          from: "router",
          to: "hop-b",
          label: "/24 match (24 bits) — WINS",
          dashed: true,
          animated: true,
        },
        { id: "a-dest", from: "hop-a", to: "dest", label: "onward, hop by hop" },
        { id: "b-dest", from: "hop-b", to: "dest", label: "delivers" },
        { id: "dv-fill", from: "dv", to: "router", label: "neighbours' claims fill the table", dashed: true },
        { id: "ls-fill", from: "ls", to: "router", label: "map + Dijkstra fill the table", dashed: true },
      ],
      steps: [
        {
          title: "A table of next hops — not paths",
          text: "Look at what the router actually stores: 'prefix → next hop'. Not the route to the destination, not the list of routers along the way — just which neighbour to hand the packet to. That minimalism is the core routing abstraction: every entry is a single local instruction, and everything beyond the next hop is someone else's problem.",
          focus: ["router"],
        },
        {
          title: "One packet, TWO matching routes",
          text: "The packet is addressed to 10.1.2.77. Check it against the table: 10.0.0.0/8 matches (the first 8 bits, '10.', agree) and 10.1.2.0/24 also matches (the first 24 bits, '10.1.2.', agree). Overlap like this is completely normal — broad prefixes are catch-alls and narrow ones are carved-out exceptions — so the router needs a deterministic tie-breaker, not an error.",
          focus: ["router", "hop-a", "hop-b", "dest"],
          edgeFocus: ["m8", "m24"],
        },
        {
          title: "Longest prefix wins — specificity beats everything",
          text: "The tie-breaker is longest-prefix match: /24 pins 24 bits of the destination while /8 pins only 8, so the /24 route is the more specific claim and it wins. Table order is irrelevant, and 'shortest' or 'first listed' never enter into it — the packet goes to Hop B. This one rule is what lets a tiny exception route override a continent-sized catch-all.",
          focus: ["router", "hop-b"],
          edgeFocus: ["m24"],
        },
        {
          title: "The path is emergent, not stored",
          text: "Hop B now repeats exactly the same game with ITS table, and so does every router after it, until one of them is directly attached to 10.1.2.77. No device anywhere holds the end-to-end path — the path is what emerges from a chain of independent local decisions. That is why routing survives failures: change one router's table and the path re-routes without anyone coordinating.",
          focus: ["hop-b", "dest"],
          edgeFocus: ["b-dest", "a-dest"],
        },
        {
          title: "Filling the table, philosophy 1: distance-vector gossip",
          text: "Where did those entries come from? A distance-vector router learns them by gossip: each neighbour periodically shares its distance table ('I can reach 10.1.2.0/24 in 3 hops') and the router trusts the claim, adds 1, and records it. The weakness is baked into the trust — after a link dies, a stale route can echo back from a neighbour and bounce between routers, incrementing toward infinity while packets loop. That count-to-infinity story is why RIP declares 16 hops 'unreachable'.",
          focus: ["dv", "router"],
          edgeFocus: ["dv-fill"],
        },
        {
          title: "Philosophy 2: link-state — everyone gets the map",
          text: "A link-state router shares facts, not conclusions: it floods 'my link to X costs 2' to the entire network, every router assembles the identical map, and each runs Dijkstra locally to compute its own next hops. Nobody can be fooled by second-hand rumours, so convergence after a failure is fast — the trade is memory and CPU to hold and recompute the full topology. That trade-off, gossip-cheap-but-loopy versus map-heavy-but-fast, IS the DV vs LS exam question.",
          focus: ["ls", "router"],
          edgeFocus: ["ls-fill"],
        },
      ],
    },
  },
];
