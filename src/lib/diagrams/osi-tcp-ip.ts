import type { TopicVisual } from "./types";

// Sender's OSI stack (left, 7 layers, coloured by TCP/IP grouping),
// the wire, and the receiver's TCP/IP stack (right, 4 layers). The
// walkthrough follows one HTTP GET all the way down, across, and
// back up — encapsulation made physical.
export const OSI_TCP_IP_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "One HTTP request through both models",
      caption:
        "Left: the sender's 7 OSI layers, coloured by the TCP/IP layer they fold into. Right: the receiver's 4 TCP/IP layers. Run the walkthrough to follow a GET request down, across the wire, and back up.",
      legend: [
        { swatch: "blue", text: "→ TCP/IP Application (OSI 5–7)" },
        { swatch: "accent", text: "→ TCP/IP Transport (OSI 4)" },
        { swatch: "green", text: "→ TCP/IP Internet (OSI 3)" },
        { swatch: "muted", text: "→ TCP/IP Link (OSI 1–2)" },
      ],
      nodes: [
        {
          id: "app",
          label: "7 · Application",
          desc: "GET /index.html",
          detail:
            "The browser produces the actual HTTP request. Everything app-specific — HTTP, DNS, SMTP — lives here. PDU: data.",
          x: 60,
          y: 10,
          kind: "blue",
        },
        {
          id: "pres",
          label: "6 · Presentation",
          desc: "TLS, UTF-8, compression",
          detail:
            "Formats and (with TLS) encrypts the bytes so both sides interpret them identically. Folded into TCP/IP's Application layer.",
          x: 60,
          y: 95,
          kind: "blue",
        },
        {
          id: "sess",
          label: "5 · Session",
          desc: "dialog control",
          detail:
            "Opens, maintains and closes the conversation between the two applications. Also folded into TCP/IP's Application layer.",
          x: 60,
          y: 180,
          kind: "blue",
        },
        {
          id: "trans",
          label: "4 · Transport",
          desc: "TCP segment · ports",
          detail:
            "TCP wraps the HTTP bytes in a segment with source/destination ports and sequence numbers, after the 3-way handshake (SYN → SYN-ACK → ACK). Guarantees order and retransmission. PDU: segment.",
          x: 60,
          y: 265,
          kind: "accent",
        },
        {
          id: "net",
          label: "3 · Network",
          desc: "IP packet · routing",
          detail:
            "IP wraps the segment in a packet with source/destination IP addresses. Routers forward it hop by hop between networks. Device: router. PDU: packet.",
          x: 60,
          y: 350,
          kind: "green",
        },
        {
          id: "link",
          label: "2 · Data Link",
          desc: "Ethernet frame · MAC",
          detail:
            "The packet is framed with MAC addresses for delivery on the LOCAL network segment only — MAC addresses change at every hop, IP addresses don't. Device: switch. PDU: frame.",
          x: 60,
          y: 435,
          kind: "muted",
        },
        {
          id: "phys",
          label: "1 · Physical",
          desc: "bits on the medium",
          detail:
            "The frame becomes voltages, light pulses or radio waves. Devices: hubs, cables, NICs. PDU: bits.",
          x: 60,
          y: 520,
          kind: "muted",
        },
        {
          id: "wire",
          label: "⚡ the wire",
          desc: "fibre · copper · air",
          detail:
            "The only place the two machines physically touch. Everything above this is agreement — protocols — not connection.",
          x: 355,
          y: 615,
          kind: "danger",
        },
        // ---- receiver: TCP/IP 4-layer view ----
        {
          id: "r-link",
          label: "Link",
          desc: "= OSI 1 + 2",
          detail:
            "The receiver's NIC reads the bits, checks the frame's MAC address and checksum, strips the frame header, and hands the packet up.",
          x: 650,
          y: 480,
          kind: "muted",
        },
        {
          id: "r-net",
          label: "Internet",
          desc: "= OSI 3",
          detail:
            "IP checks the destination address is this machine, strips the IP header, and hands the segment up. On intermediate routers, the journey STOPS at this layer — routers never look at layer 4+.",
          x: 650,
          y: 350,
          kind: "green",
        },
        {
          id: "r-trans",
          label: "Transport",
          desc: "= OSI 4",
          detail:
            "TCP re-orders segments, acknowledges receipt, requests retransmission of anything missing, strips its header, and delivers a clean byte stream to the right port.",
          x: 650,
          y: 220,
          kind: "accent",
        },
        {
          id: "r-app",
          label: "Application",
          desc: "= OSI 5 + 6 + 7",
          detail:
            "The web server finally sees exactly the bytes the browser sent: 'GET /index.html'. Every wrapper added on the way down was removed on the way up, in reverse order.",
          x: 650,
          y: 80,
          kind: "blue",
        },
      ],
      edges: [
        { id: "e1", from: "app", to: "pres" },
        { id: "e2", from: "pres", to: "sess" },
        { id: "e3", from: "sess", to: "trans", label: "data" },
        { id: "e4", from: "trans", to: "net", label: "+ TCP header = segment" },
        { id: "e5", from: "net", to: "link", label: "+ IP header = packet" },
        { id: "e6", from: "link", to: "phys", label: "+ frame header = frame" },
        { id: "e7", from: "phys", to: "wire", label: "bits" },
        { id: "e8", from: "wire", to: "r-link", label: "bits" },
        { id: "e9", from: "r-link", to: "r-net", label: "− frame header" },
        { id: "e10", from: "r-net", to: "r-trans", label: "− IP header" },
        { id: "e11", from: "r-trans", to: "r-app", label: "− TCP header" },
        { id: "peer", from: "trans", to: "r-trans", label: "logical peer talk", dashed: true },
      ],
      steps: [
        {
          title: "The request is born at the top",
          text: "The browser writes 'GET /index.html'. Layers 7–6–5 (app logic, TLS/encoding, session) shape those bytes — TCP/IP is honest that these are one job and merges them into a single Application layer. Nothing has been sent yet; this is pure data.",
          focus: ["app", "pres", "sess"],
          edgeFocus: ["e1", "e2"],
        },
        {
          title: "Transport wraps it in a segment",
          text: "TCP prepends a header: source/destination ports, sequence numbers. This is the first envelope — data becomes a SEGMENT. TCP's promises (ordering, retransmission) are made end-to-end: only the two endpoints run this layer's logic, never the routers in between.",
          focus: ["trans"],
          edgeFocus: ["e3", "e4"],
        },
        {
          title: "Network addresses it across the world",
          text: "IP wraps the segment in a PACKET with source and destination IP addresses. This is the layer that gets data across NETWORKS — every router on the path reads exactly this header and no deeper. Failure smell: 'reachable on my LAN but not beyond' points here.",
          focus: ["net"],
          edgeFocus: ["e5"],
        },
        {
          title: "Link + Physical put it on the local wire",
          text: "Ethernet frames the packet with MAC addresses — valid only for the CURRENT hop; they're rewritten at every router while the IP addresses stay fixed. Then layer 1 turns the frame into signals. Notice the nesting: HTTP inside TCP inside IP inside Ethernet — envelopes inside envelopes. That is encapsulation.",
          focus: ["link", "phys"],
          edgeFocus: ["e6", "e7"],
        },
        {
          title: "Across the wire, then up in reverse",
          text: "The receiver unwraps in exactly reverse order — frame off, packet off, segment off — each layer reading ONLY the header its peer wrote. By the top, the server sees the exact bytes the browser produced. Decapsulation is why layers can evolve independently: swap Wi-Fi for fibre and layers 3+ never notice.",
          focus: ["wire", "r-link", "r-net", "r-trans", "r-app"],
          edgeFocus: ["e8", "e9", "e10", "e11"],
        },
        {
          title: "Peers talk to peers",
          text: "The deepest idea in the model: sender's TCP and receiver's TCP behave as if they talk DIRECTLY to each other (dashed line) — negotiating, acknowledging, retransmitting — while physically everything detours down to the wire and back up. Every layer has this virtual peer conversation. Exam heuristic: name the failure, and you've named the layer.",
          focus: ["trans", "r-trans"],
          edgeFocus: ["peer"],
        },
      ],
    },
  },
  {
    kind: "mermaid",
    title: "TCP's three-way handshake",
    caption:
      "Before any HTTP byte moves, TCP's endpoints agree on sequence numbers — the basis for ordering and retransmission.",
    chart: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: both sides pick a random initial sequence number (ISN)
    C->>S: SYN (seq = x)
    Note right of S: server learns x,<br/>allocates connection state
    S->>C: SYN-ACK (seq = y, ack = x+1)
    Note left of C: client learns y —<br/>both ISNs now known
    C->>S: ACK (ack = y+1)
    Note over C,S: connection ESTABLISHED — every later byte is<br/>numbered, so loss and reordering are detectable
    C->>S: GET /index.html (seq = x+1)`,
    notes: [
      {
        label: "Why three messages and not two",
        text: "Each side must prove it can both send AND receive. SYN proves client→server works; SYN-ACK proves server→client; the final ACK proves the client heard the server. Two messages would leave the server unsure its reply ever arrived.",
      },
      {
        label: "Sequence numbers are the real payload",
        text: "The handshake's job is exchanging initial sequence numbers. Once every byte is numbered, 'reliable delivery' reduces to bookkeeping: gaps trigger retransmission, duplicates are dropped, reordering is undone by sorting.",
      },
      {
        label: "This is why UDP is faster to start",
        text: "UDP simply skips all of this — no state, no round trip before data. A DNS lookup fits in one UDP packet each way; forcing a handshake would triple its latency. That trade is the whole TCP-vs-UDP exam question.",
      },
    ],
  },
];
