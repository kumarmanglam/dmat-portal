import type { TopicContent } from "../types";

export const NETWORKS_CONTENT: TopicContent[] = [
  {
    id: "osi-tcp-ip",
    intro:
      "Layering is division of labour: each layer solves one problem and hands the rest down, wrapping the data like envelopes (encapsulation). You don't memorise seven names — you ask 'who is responsible for THIS failure?': wrong voltage → physical; local delivery by MAC → data link; getting across networks by IP → network; end-to-end delivery and retransmission → transport; everything app-specific → the top.",
    bullets: [
      "OSI 7 → TCP/IP 4 mapping: App+Presentation+Session → Application; Transport → Transport; Network → Internet; DataLink+Physical → Link.",
      "Routers work at layer 3 (IP), switches at layer 2 (MAC), hubs/cables at layer 1.",
      "TCP: connection, ordering, retransmission (3-way handshake SYN → SYN-ACK → ACK). UDP: fire-and-forget, no guarantees, less overhead.",
      "Each layer only talks to its peer layer on the other machine — via the layers below.",
    ],
    questions: [
      {
        prompt:
          "A video call tolerates a lost frame but not delay; a file download tolerates delay but not corruption or loss. Which transport protocols match?",
        options: [
          "Video → UDP, download → TCP",
          "Video → TCP, download → UDP",
          "Both TCP",
          "Both UDP",
        ],
        answer: 0,
        explain:
          "Retransmitting a stale video frame is useless (UDP's low latency wins); a file must arrive complete and ordered (TCP's guarantees win).",
      },
      {
        prompt: "In the TCP three-way handshake, what is the correct sequence?",
        options: [
          "SYN → SYN-ACK → ACK",
          "ACK → SYN → SYN-ACK",
          "SYN → ACK → SYN-ACK",
          "HELLO → OK → DATA",
        ],
        answer: 0,
        explain:
          "Client proposes (SYN), server accepts and proposes back (SYN-ACK), client confirms (ACK) — both sides agree on sequence numbers.",
      },
      {
        prompt:
          "A device forwards packets between different networks based on IP addresses. At which OSI layer does it primarily operate, and what is it called?",
        options: [
          "Layer 3 (network) — a router",
          "Layer 2 (data link) — a switch",
          "Layer 4 (transport) — a gateway",
          "Layer 1 (physical) — a repeater",
        ],
        answer: 0,
        explain: "IP addressing and inter-network forwarding are the network layer's job — routers.",
      },
      {
        prompt:
          "When an HTTP request travels down the stack, each layer adds its own header around the data from above. This process is called:",
        options: ["Encapsulation", "Fragmentation", "Multiplexing", "Serialization"],
        answer: 0,
        explain:
          "TCP wraps the HTTP bytes in a segment, IP wraps that in a packet, Ethernet in a frame — envelopes inside envelopes.",
      },
    ],
  },
  {
    id: "routing-basics",
    intro:
      "Routing protocols answer 'which neighbour do I hand this packet to?'. Two philosophies: distance-vector routers gossip — each periodically tells neighbours its distance table and trusts what it hears (simple, but rumours propagate slowly and can loop: count-to-infinity). Link-state routers each learn the full map of the network and run Dijkstra locally (faster convergence, more memory/CPU).",
    bullets: [
      "Distance-vector (e.g. RIP): know only neighbours' claims; slow convergence; hop-count limits mitigate loops.",
      "Link-state (e.g. OSPF): flood link info, every router computes shortest paths itself on the full topology.",
      "A routing table stores next hop per destination network — not the whole path.",
      "Longest-prefix match: the most specific matching route wins (10.1.2.0/24 beats 10.0.0.0/8).",
    ],
    questions: [
      {
        prompt:
          "After a link fails, routers running protocol X keep exchanging their distance tables for minutes while routes slowly increment toward a maximum — packets loop meanwhile. Which protocol family and failure is this?",
        options: [
          "Distance-vector — the count-to-infinity problem",
          "Link-state — Dijkstra divergence",
          "Static routing — table overflow",
          "Link-state — flooding storm",
        ],
        answer: 0,
        explain:
          "Trusting neighbours' second-hand claims lets stale routes bounce back and forth, incrementing until the hop limit — classic distance-vector weakness.",
      },
      {
        prompt: "What does each router in a link-state network (like OSPF) actually compute, and with what input?",
        options: [
          "Shortest paths via Dijkstra, on a full map of the topology built from flooded link advertisements",
          "The average of its neighbours' tables",
          "A random spanning tree",
          "Only routes to directly connected networks",
        ],
        answer: 0,
        explain:
          "Every router floods its link states; all routers assemble the same graph and independently run Dijkstra on it.",
      },
      {
        prompt:
          "A router has routes 10.0.0.0/8 → hop A and 10.1.2.0/24 → hop B. A packet arrives for 10.1.2.77. Where does it go?",
        options: [
          "Hop B — longest (most specific) prefix match wins",
          "Hop A — the first entry wins",
          "Both, duplicated",
          "Dropped as ambiguous",
        ],
        answer: 0,
        explain: "/24 matches more bits of the destination than /8, so the more specific route is chosen.",
      },
      {
        prompt: "What is stored in an IP routing table entry — the key routing abstraction?",
        options: [
          "Destination network → next hop (and interface), not the complete path",
          "The full list of routers to every destination",
          "MAC addresses of all hosts",
          "DNS names of destinations",
        ],
        answer: 0,
        explain:
          "Routing is hop-by-hop: each router only decides the next step; the path emerges from all routers' local decisions.",
      },
    ],
  },
  {
    id: "encryption",
    intro:
      "Symmetric crypto is one shared key doing both locking and unlocking — fast, but the key must somehow reach the other side safely. Asymmetric crypto splits the key: what the public key locks, only the private key opens — slow, but nothing secret needs transporting. Real systems (TLS) are hybrids: asymmetric handshake to agree on a symmetric session key, then fast symmetric encryption for the actual data.",
    bullets: [
      "Symmetric (AES): fast, one shared secret — the key distribution problem.",
      "Asymmetric (RSA/ECC): public key encrypts / verifies, private key decrypts / signs — solves distribution, ~1000× slower.",
      "Hash (SHA-256): one-way fingerprint, no key, detects any change — integrity, not secrecy.",
      "Digital signature = hash the message, encrypt the hash with your PRIVATE key; anyone verifies with your public key.",
      "TLS: certificate proves the server's identity, asymmetric exchange establishes the session key, symmetric cipher carries the traffic.",
    ],
    questions: [
      {
        prompt:
          "Why does TLS use asymmetric cryptography only at the start of the connection and symmetric encryption afterwards?",
        options: [
          "Asymmetric solves key exchange but is slow; symmetric is fast once both sides share a session key",
          "Symmetric encryption is more secure than asymmetric",
          "Certificates expire during long connections",
          "Asymmetric keys can only encrypt one block",
        ],
        answer: 0,
        explain:
          "The handshake uses expensive asymmetric operations exactly once to agree on a cheap symmetric session key — best of both worlds.",
      },
      {
        prompt:
          "Alice wants anyone to be able to verify that a message really came from her and wasn't altered. What does she do?",
        options: [
          "Hash the message and encrypt the hash with her private key (digital signature)",
          "Encrypt the message with her public key",
          "Hash the message and keep the hash secret",
          "Encrypt the message with the recipient's private key",
        ],
        answer: 0,
        explain:
          "Only Alice's private key can produce a signature her public key verifies; the hash pins the exact content.",
      },
      {
        prompt:
          "A download page shows a SHA-256 checksum next to the file. What does comparing your downloaded file's hash against it protect you from?",
        options: [
          "Corruption or tampering of the file in transit — integrity",
          "Eavesdroppers reading the file — confidentiality",
          "The server going offline — availability",
          "Nothing, hashes are reversible",
        ],
        answer: 0,
        explain:
          "Any changed byte changes the hash. It proves integrity only — it hides nothing and proves no identity by itself.",
      },
      {
        prompt:
          "10 employees need pairwise-confidential channels using ONLY symmetric keys. Roughly how many keys are needed, and what does this illustrate?",
        options: [
          "45 keys (n·(n−1)/2) — the key-distribution problem asymmetric crypto solves",
          "10 keys — one per person",
          "1 shared key for everyone",
          "100 keys — one per direction",
        ],
        answer: 0,
        explain:
          "Every pair needs its own secret: 10·9/2 = 45. With asymmetric crypto, each person needs just one key pair.",
      },
    ],
  },
  {
    id: "security-goals",
    intro:
      "Every attack scenario on the exam maps to one primary goal — ask 'what did the attacker actually achieve?'. Read secrets they shouldn't see → Confidentiality. Change data or system behaviour → Integrity. Pass themselves off as someone else → Authenticity. Make the service unusable → Availability. The word 'primarily' matters: pick the most direct violation, not knock-on effects.",
    bullets: [
      "Confidentiality — data visible only to authorised parties (breaches, leaks, sniffing).",
      "Integrity — data/system unmodified (defacement, tampering, malware altering behaviour).",
      "Authenticity — identities verifiable (spoofing, credential theft used to log in, session hijacking).",
      "Availability — service reachable when needed (DoS/DDoS, ransomware's lockout side).",
    ],
    questions: [
      {
        prompt:
          "An SQL-injection flaw lets attackers dump the full user table, including email addresses and password hashes. Which goal is primarily violated?",
        options: ["Confidentiality", "Integrity", "Authenticity", "Availability"],
        answer: 0,
        explain: "Data that should be private was read by an unauthorised party — the definition of a confidentiality breach.",
      },
      {
        prompt:
          "Attackers replace a city portal's homepage with their own banner overnight. The site stays reachable. Primarily violated?",
        options: ["Integrity", "Confidentiality", "Availability", "Authenticity"],
        answer: 0,
        explain:
          "Content was modified without authorisation. The site still serves (availability intact) and nothing secret leaked.",
      },
      {
        prompt:
          "Using phished credentials, an attacker logs into the CEO's account and sends payment instructions from it. Primarily violated?",
        options: ["Authenticity", "Availability", "Confidentiality", "None — phishing is social, not technical"],
        answer: 0,
        explain:
          "The system can no longer trust that 'CEO account' means the CEO — identity verification is broken.",
      },
      {
        prompt:
          "A botnet floods a ticket shop with requests on launch day; legitimate buyers get timeouts. Primarily violated?",
        options: ["Availability", "Integrity", "Confidentiality", "Authenticity"],
        answer: 0,
        explain: "No data read or changed, no identity faked — the service simply can't serve. Classic DDoS = availability.",
      },
      {
        prompt:
          "A man-in-the-middle silently rewrites the account number inside bank transfer requests as they pass through. Primarily violated?",
        options: ["Integrity", "Availability", "Authenticity", "Confidentiality"],
        answer: 0,
        explain:
          "The data in transit is being altered — integrity. (Reading it silently would have been confidentiality.)",
      },
    ],
  },
];
