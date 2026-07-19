import type { TopicContent } from "../types";

export const NETWORKS_CONTENT: TopicContent[] = [
  {
    id: "osi-tcp-ip",
    whyItMatters:
      "When a page won't load, 'the network is down' is useless — the layer model is the checklist that turns a vague outage into one question: is it the cable, the LAN, the route, the connection, or the app?",
    intro:
      "Layering is division of labour: each layer solves one problem and hands the rest down, wrapping the data like envelopes (encapsulation). You don't memorise seven names — you ask 'who is responsible for THIS failure?': wrong voltage → physical; local delivery by MAC → data link; getting across networks by IP → network; end-to-end delivery and retransmission → transport; everything app-specific → the top.",
    analogy:
      "Sending data is like mailing a letter through nested envelopes. Your message (the app data) goes in an envelope addressed to the recipient (transport), that envelope goes inside one addressed to their city's post office (IP), which goes in a mail sack routed between local depots by MAC (data link). Each depot opens only its own outer envelope, does its one job, and passes the rest along — never reading your actual letter.",
    bullets: [
      "OSI 7 → TCP/IP 4 mapping: App+Presentation+Session → Application; Transport → Transport; Network → Internet; DataLink+Physical → Link.",
      "Routers work at layer 3 (IP), switches at layer 2 (MAC), hubs/cables at layer 1.",
      "TCP: connection, ordering, retransmission (3-way handshake SYN → SYN-ACK → ACK). UDP: fire-and-forget, no guarantees, less overhead.",
      "Each layer only talks to its peer layer on the other machine — via the layers below.",
    ],
    workedExample: {
      scenario:
        "Your browser sends an HTTP GET for a page. Follow the request down the sender's stack, layer by layer.",
      steps: [
        "Application: the browser produces the raw HTTP request text ('GET /index.html …').",
        "Transport (TCP): wraps that text in a segment, adding source/destination ports and a sequence number for ordering and retransmission.",
        "Network (IP): wraps the segment in a packet, stamping source and destination IP addresses so it can cross networks.",
        "Data link (Ethernet): wraps the packet in a frame with the next-hop MAC address for delivery on the local wire; the physical layer then sends it as signals.",
      ],
      result:
        "The data travels as a frame-inside-packet-inside-segment-inside-HTTP nest. The receiver reverses the process (de-encapsulation), each layer stripping its own header and handing the payload up to its peer.",
    },
    gotchas: [
      "A switch is a layer-2 device (forwards frames by MAC on one network); a router is layer 3 (forwards packets by IP between networks) — different jobs, different addresses.",
      "TCP is NOT 'more correct' than UDP — UDP deliberately drops ordering and retransmission to win latency; the right choice depends on the app.",
      "The same data has three names by layer: it's a segment at transport, a packet at network, a frame at data link — not three different things, just three envelopes.",
    ],
    quickCheck: {
      prompt:
        "A file arrives at the correct machine, but some bytes are missing and the pieces landed out of order. Which layer is responsible for detecting this and requesting a resend?",
      options: [
        "Transport (TCP) — end-to-end ordering and retransmission",
        "Network (IP) — it guarantees ordered delivery",
        "Data link — MAC framing reorders packets",
        "Application — HTTP re-requests each missing byte",
      ],
      answer: 0,
      explain:
        "IP delivers packets to the right host but makes no ordering or reliability promise. TCP at the transport layer sequences segments and retransmits missing ones — that is exactly its job.",
    },
    deepDive: [
      {
        title: "Why layering is worth the header overhead",
        body: "Because each layer only talks to its peer through a fixed interface, you can swap one layer's technology without touching the others: move from copper to fibre (layer 1), from Ethernet to Wi-Fi (layer 2), or from IPv4 to IPv6 (layer 3), and TCP and your HTTP app keep working unchanged. That independence — not tidiness — is why every layer pays the cost of its own header.",
      },
    ],
    recap:
      "Layering splits networking into independent jobs, and encapsulation wraps data in one header per layer on the way down (stripped on the way up). To debug, ask which layer owns the failure: cable, MAC, IP, connection, or app.",
    related: ["routing-basics", "encryption", "security-goals"],
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
    whyItMatters:
      "When traffic to one subnet mysteriously loops or blackholes after a link flaps, the answer is almost always in how your routing protocol converges — distance-vector and link-state fail in different, recognisable ways.",
    intro:
      "Routing protocols answer 'which neighbour do I hand this packet to?'. Two philosophies: distance-vector routers gossip — each periodically tells neighbours its distance table and trusts what it hears (simple, but rumours propagate slowly and can loop: count-to-infinity). Link-state routers each learn the full map of the network and run Dijkstra locally (faster convergence, more memory/CPU).",
    analogy:
      "Distance-vector routing is asking people at each intersection 'how far to the airport that way?' and trusting their answer — fast to ask, but if someone repeats a stale rumour you can circle for ages. Link-state is handing every driver the whole city map so each computes the best route themselves — more to carry, but nobody is fooled by second-hand gossip.",
    bullets: [
      "Distance-vector (e.g. RIP): know only neighbours' claims; slow convergence; hop-count limits mitigate loops.",
      "Link-state (e.g. OSPF): flood link info, every router computes shortest paths itself on the full topology.",
      "A routing table stores next hop per destination network — not the whole path.",
      "Longest-prefix match: the most specific matching route wins (10.1.2.0/24 beats 10.0.0.0/8).",
    ],
    workedExample: {
      scenario:
        "A router's table holds 10.0.0.0/8 → hop A, 10.1.0.0/16 → hop B, and 10.1.2.0/24 → hop C. A packet arrives destined for 10.1.2.77.",
      steps: [
        "Check every route for a match: does the destination fall inside the prefix?",
        "10.0.0.0/8 matches (first 8 bits '10' agree) — candidate via A.",
        "10.1.0.0/16 matches (first 16 bits '10.1' agree) — candidate via B.",
        "10.1.2.0/24 matches (first 24 bits '10.1.2' agree) — candidate via C, and it is the most specific.",
      ],
      result:
        "Longest-prefix match wins: /24 pins more bits than /16 or /8, so the packet goes to hop C. Specificity beats order in the table — the router never just takes the first match.",
    },
    gotchas: [
      "Distance-vector routers share their distance TABLE with neighbours; link-state routers flood raw link info so each builds the WHOLE map — sharing conclusions is not sharing the map.",
      "A routing table stores the NEXT HOP per destination, NOT the full end-to-end path — the path emerges from every router's local choice.",
      "Longest-prefix match picks the MOST SPECIFIC route, NOT the first-listed or shortest one — /24 beats /8 regardless of table order.",
    ],
    quickCheck: {
      prompt:
        "A network operator wants the fastest possible reconvergence after a link fails and the routers have ample CPU and memory. Which protocol family fits, and why?",
      options: [
        "Link-state — each router has the full topology, so it recomputes shortest paths immediately instead of waiting for gossip to settle",
        "Distance-vector — periodic table swaps converge fastest",
        "Distance-vector — it uses less memory, which speeds convergence",
        "Neither — convergence speed is fixed by cable length",
      ],
      answer: 0,
      explain:
        "Link-state floods link changes and every router reruns Dijkstra on the complete map, so it reconverges quickly. Distance-vector must wait for iterative table exchanges and can loop (count-to-infinity) meanwhile.",
    },
    deepDive: [
      {
        title: "How distance-vector fights its own loops",
        body: "Count-to-infinity happens because a router can hear its own stale route echoed back by a neighbour. Split horizon stops this by never advertising a route back out the interface it was learned from; poison reverse goes further, advertising that route back with an infinite metric to actively deny it. These tricks plus a low 'infinity' (RIP caps hop count at 16) bound the damage — they don't eliminate it, which is why link-state scales better.",
      },
    ],
    recap:
      "Routing is hop-by-hop: each router picks only the next hop, and the path emerges from all of them. Distance-vector trusts neighbours' totals (simple, loop-prone); link-state shares the whole map and runs Dijkstra (fast, heavier).",
    related: ["osi-tcp-ip", "graphs", "system-architecture"],
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
    whyItMatters:
      "Every 'https' padlock you rely on is a hybrid scheme under the hood — knowing which key does what is how you reason about whether a design actually protects secrecy, or just proves who sent something.",
    intro:
      "Symmetric crypto is one shared key doing both locking and unlocking — fast, but the key must somehow reach the other side safely. Asymmetric crypto splits the key: what the public key locks, only the private key opens — slow, but nothing secret needs transporting. Real systems (TLS) are hybrids: asymmetric handshake to agree on a symmetric session key, then fast symmetric encryption for the actual data.",
    analogy:
      "Symmetric crypto is one key that both locks and unlocks a safe — great, once both of you somehow have a copy of that key. Asymmetric crypto is an open padlock you hand out freely: anyone can snap it shut on a box (encrypt with your public key), but only you hold the key that opens it (your private key), so nothing secret ever has to travel.",
    bullets: [
      "Symmetric (AES): fast, one shared secret — the key distribution problem.",
      "Asymmetric (RSA/ECC): public key encrypts / verifies, private key decrypts / signs — solves distribution, ~1000× slower.",
      "Hash (SHA-256): one-way fingerprint, no key, detects any change — integrity, not secrecy.",
      "Digital signature = hash the message, encrypt the hash with your PRIVATE key; anyone verifies with your public key.",
      "TLS: certificate proves the server's identity, asymmetric exchange establishes the session key, symmetric cipher carries the traffic.",
    ],
    workedExample: {
      scenario:
        "Your browser opens an HTTPS connection to a shop. Watch how it uses two kinds of crypto in sequence.",
      steps: [
        "The server presents a certificate; the browser checks it against a trusted authority to confirm the server's identity and obtain its public key.",
        "The two sides run an asymmetric exchange (using that public key) to agree on a fresh shared secret without ever sending it in the clear.",
        "Both derive the same symmetric session key from that secret.",
        "All page data now flows under fast symmetric encryption (AES) using the session key.",
      ],
      result:
        "Asymmetric crypto is used once, only to solve key distribution and identity; symmetric crypto carries the bulk traffic because it is ~1000× faster. You get both trust and speed.",
    },
    gotchas: [
      "A hash gives INTEGRITY (did the bytes change?), NOT confidentiality — it hides nothing and, alone, proves no identity.",
      "You encrypt for secrecy with the recipient's PUBLIC key, but you sign for authenticity with your own PRIVATE key — same key pair, opposite directions.",
      "Asymmetric is NOT 'more secure' than symmetric — it is far slower and exists to solve key distribution, which is why real systems combine the two.",
    ],
    quickCheck: {
      prompt:
        "Bob publishes his public key. Alice wants to send Bob a message only Bob can read. Which key does she encrypt with?",
      options: [
        "Bob's public key — only Bob's matching private key can decrypt it",
        "Bob's private key — so only Bob can open it",
        "Her own private key — that keeps it secret",
        "A hash of the message — hashing makes it confidential",
      ],
      answer: 0,
      explain:
        "For confidentiality you lock with the recipient's public key; only the holder of the matching private key (Bob) can unlock. Signing with a private key proves identity, but does not hide the message.",
    },
    deepDive: [
      {
        title: "One key pair, two opposite goals",
        body: "The same public/private pair serves confidentiality and authenticity by running in opposite directions. Encrypt with the recipient's PUBLIC key → only their private key decrypts → confidentiality. Encrypt (sign) a hash with your PRIVATE key → anyone's copy of your public key verifies it → authenticity and integrity. Mixing these up is the classic exam trap: 'encrypt with your private key to keep it secret' is wrong, because everyone has your public key and can read it.",
      },
    ],
    recap:
      "Symmetric = one shared key, fast, but hard to distribute; asymmetric = public/private pair that solves distribution but is slow. TLS is a hybrid: asymmetric to agree a session key, symmetric to move the data.",
    related: ["security-goals", "osi-tcp-ip"],
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
    whyItMatters:
      "In an incident review the first question is always 'what did the attacker actually break?' — naming the primary CIA+A goal violated is what drives the right fix and the right disclosure.",
    intro:
      "Every attack scenario on the exam maps to one primary goal — ask 'what did the attacker actually achieve?'. Read secrets they shouldn't see → Confidentiality. Change data or system behaviour → Integrity. Pass themselves off as someone else → Authenticity. Make the service unusable → Availability. The word 'primarily' matters: pick the most direct violation, not knock-on effects.",
    analogy:
      "Think of a bank branch. Confidentiality is the sealed vault nobody unauthorised can peer into; integrity is the ledger whose balances no one can secretly rewrite; authenticity is the teller checking your ID before acting as 'you'; availability is the doors being open during business hours. An attack breaks whichever of these it targets most directly.",
    bullets: [
      "Confidentiality — data visible only to authorised parties (breaches, leaks, sniffing).",
      "Integrity — data/system unmodified (defacement, tampering, malware altering behaviour).",
      "Authenticity — identities verifiable (spoofing, credential theft used to log in, session hijacking).",
      "Availability — service reachable when needed (DoS/DDoS, ransomware's lockout side).",
    ],
    workedExample: {
      scenario:
        "A hospital is hit by ransomware: files are encrypted in place and staff are locked out of patient records until a payment is made. Which single goal is primarily violated?",
      steps: [
        "Was data read by someone unauthorised? Not the point of the attack — confidentiality is not the primary target.",
        "Was data altered to deceive? The files are scrambled, but the attacker's aim isn't to feed false data — it's to deny access.",
        "Was an identity faked to gain trust? No spoofing is involved.",
        "Can legitimate staff use the service? No — records are unreachable until ransom is paid.",
      ],
      result:
        "The primary violation is Availability: the data and service are made unusable. (Ransomware can have secondary effects, but 'primarily' points to the lockout — denial of access.)",
    },
    gotchas: [
      "Confidentiality (someone READ data) is NOT integrity (someone CHANGED data) — a silent eavesdrop and a silent edit are different violations.",
      "An availability attack neither reads nor alters the data — it just denies access, so DoS/DDoS is availability, not confidentiality.",
      "Authenticity is about WHO (is this really the CEO?), NOT about WHAT is secret — stolen credentials used to log in break authenticity even if nothing is leaked.",
    ],
    quickCheck: {
      prompt:
        "An attacker intercepts and stores encrypted traffic but cannot decrypt it, so they cannot read it — yet they replay old valid login messages to impersonate a user. Which goal is primarily violated by the replay?",
      options: [
        "Authenticity — the system is fooled into accepting the attacker as a legitimate user",
        "Confidentiality — the traffic was captured",
        "Availability — the replay slows the server",
        "Integrity — the messages were unchanged, so nothing is violated",
      ],
      answer: 0,
      explain:
        "The captured traffic stayed unreadable, so confidentiality held. The harm is that replaying valid messages makes the system trust the wrong identity — an authenticity failure (which is why protocols add nonces/timestamps).",
    },
    deepDive: [
      {
        title: "Why 'primarily' is the whole game",
        body: "Most real incidents touch several goals at once — a breach that dumps and then alters records hits confidentiality AND integrity, and a ransomware lockout can leak data too. Exam questions say 'primarily' to force you past the ripple effects to the attacker's most direct achievement. Map the single most immediate consequence: what could they do the instant the attack succeeded, before any follow-on?",
      },
    ],
    recap:
      "CIA+A sorts attacks by what the attacker directly achieved: read (Confidentiality), change (Integrity), impersonate (Authenticity), or deny access (Availability). When several apply, 'primarily' means the most direct violation.",
    related: ["encryption", "system-architecture"],
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
