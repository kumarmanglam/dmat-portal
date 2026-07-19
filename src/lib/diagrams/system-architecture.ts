import type { TopicVisual } from "./types";

// Monolith (left) vs microservices (right) on one canvas — the
// Black Friday scaling story, including the tax (the dashed
// network call that can fail).
export const SYSTEM_ARCHITECTURE_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Monolith vs microservices — the Black Friday test",
      flow: "free",
      caption:
        "Left: one deployable, one database. Right: services split by business capability, each independently scaled. The walkthrough plays out what happens when ONLY checkout gets hot.",
      legend: [
        { swatch: "accent", text: "monolith — everything ships together" },
        { swatch: "green", text: "the hot spot, scaled independently" },
        { swatch: "blue", text: "other services / infrastructure" },
        { swatch: "danger", text: "the tax — network calls can fail" },
      ],
      nodes: [
        {
          id: "mono",
          label: "Monolith",
          desc: "UI + logic + data access",
          detail:
            "One codebase, one process, one deployable. Function calls between modules are in-process — nanoseconds, and they cannot 'fail' the way a network can. Simple to build, test, debug and deploy.",
          x: 80,
          y: 120,
          kind: "accent",
        },
        {
          id: "monodb",
          label: "Single DB",
          desc: "one schema, ACID everywhere",
          detail:
            "All modules share one database, so a single transaction can span orders, payments and inventory. Distributed-transaction pain simply doesn't exist here.",
          x: 80,
          y: 280,
          kind: "blue",
        },
        {
          id: "monoscale",
          label: "Scaling = replicate ALL of it",
          desc: "3 copies to serve 1 hot path",
          detail:
            "To survive checkout load, you must run three full copies of the ENTIRE application — browsing, admin, reporting included — because the unit of scaling is the whole deployable. RAM and licence costs scale with the whole app, not the hot spot.",
          x: 80,
          y: 440,
          kind: "muted",
        },
        {
          id: "lb",
          label: "Load balancer",
          desc: "spreads requests",
          detail:
            "Routes each request to any healthy instance of the target service. This only works when instances are stateless — session state must live in a shared store, or the next request may hit a different instance that knows nothing about you.",
          x: 430,
          y: 20,
          kind: "blue",
        },
        {
          id: "browse",
          label: "Browse svc ×1",
          desc: "calm traffic",
          detail:
            "Product browsing is read-heavy and cache-friendly; one instance is plenty even on Black Friday. It ships on its own schedule — a checkout deploy can't break browsing.",
          x: 320,
          y: 170,
          kind: "blue",
        },
        {
          id: "checkout",
          label: "Checkout svc ×4",
          desc: "the hot spot — scaled alone",
          detail:
            "Four instances of ONLY this service absorb the spike. That's the headline benefit of the split: the unit of scaling is the business capability, so money is spent exactly where the load is.",
          x: 560,
          y: 170,
          kind: "green",
        },
        {
          id: "payment",
          label: "Payment svc ×1",
          desc: "called by checkout",
          detail:
            "A separate service with its own datastore, reached over the network. Checkout must now handle payment being slow, down, or unreachable — retries, timeouts, idempotency keys. None of that code existed in the monolith.",
          x: 560,
          y: 360,
          kind: "blue",
        },
        {
          id: "dbs",
          label: "One DB per service",
          desc: "distributed data",
          detail:
            "Each service owns its data — no shared schema to fight over, but also no cross-service ACID transaction. 'Order saved but payment lost' becomes a real scenario you must design for (sagas, eventual consistency).",
          x: 320,
          y: 360,
          kind: "muted",
        },
        {
          id: "tax",
          label: "The microservice tax",
          desc: "latency · partial failure · ops",
          detail:
            "Network latency on every hop, partial failures, distributed data, deployment tooling, observability — a real, permanent cost paid on every request and every on-call shift. Worth it at scale, ruinous for a 4-person startup.",
          x: 430,
          y: 520,
          kind: "danger",
        },
      ],
      edges: [
        { id: "m1", from: "mono", to: "monodb", label: "in-process calls" },
        { id: "m2", from: "mono", to: "monoscale", dashed: true, label: "to scale…" },
        { id: "s1", from: "lb", to: "browse" },
        { id: "s2", from: "lb", to: "checkout" },
        { id: "s3", from: "checkout", to: "payment", label: "network call — can fail!", dashed: true, animated: true },
        { id: "s4", from: "browse", to: "dbs" },
        { id: "s5", from: "payment", to: "dbs", dashed: true },
        { id: "s6", from: "checkout", to: "tax", dashed: true },
      ],
      steps: [
        {
          title: "Monolith anatomy",
          text: "Everything — UI, business logic, data access — is one process talking to one database. Calls between modules are function calls: no latency, no partial failure, and one transaction can touch every table. For a small team this simplicity is not a compromise; it's the correct engineering choice.",
          focus: ["mono", "monodb"],
          edgeFocus: ["m1"],
        },
        {
          title: "Black Friday hits the monolith",
          text: "Only checkout is overloaded — but the unit of deployment is the unit of scaling, so you must replicate the WHOLE application to add checkout capacity. Three full copies, each carrying browsing, admin and reporting as dead weight. It works (this is how most companies actually survive spikes), it's just inefficient.",
          focus: ["mono", "monoscale"],
          edgeFocus: ["m2"],
        },
        {
          title: "Split by business capability",
          text: "Microservices cut along business seams — browse, checkout, payment — not technical layers. Each service is separately deployable and separately owned. The load balancer spreads traffic per service, which requires instances to be stateless: any copy must be able to serve any request.",
          focus: ["lb", "browse", "checkout", "payment"],
          edgeFocus: ["s1", "s2"],
        },
        {
          title: "The headline benefit: scale the hot spot only",
          text: "Checkout runs ×4 while browse stays ×1. Capacity — and money — goes exactly where the load is, and teams deploy independently: a browse bug-fix at 2pm can't take checkout down. This precise sentence ('scale ONLY the overloaded service') is what the exam wants when it asks what microservices buy you.",
          focus: ["checkout", "browse"],
          edgeFocus: ["s2"],
        },
        {
          title: "The tax: the dashed line",
          text: "Checkout → payment is now a NETWORK call: milliseconds instead of nanoseconds, and it can time out, fail halfway, or double-charge on a blind retry. Each service owning its data also kills cross-service ACID — consistency becomes an application-level design problem. The dashed line is where distributed-systems engineering actually lives.",
          focus: ["checkout", "payment", "dbs", "tax"],
          edgeFocus: ["s3", "s5", "s6"],
        },
        {
          title: "The exam verdict rule",
          text: "Neither side 'wins' — the question always hides a deciding fact: team size, traffic shape, or a proven hot spot. Four engineers with one product → monolith, split later along proven seams. Uneven load with independent teams → microservices earn their tax. Answers that pick an architecture on principle rather than on the scenario's facts are the trap options.",
          focus: ["mono", "checkout", "tax"],
        },
      ],
    },
  },
];
