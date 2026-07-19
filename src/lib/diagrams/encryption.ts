import type { TopicVisual } from "./types";

// TLS as a sequence diagram (the hybrid asymmetric→symmetric story)
// plus a flowchart for the "which tool for which job" decision.
export const ENCRYPTION_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "TLS: expensive handshake once, cheap crypto forever",
    caption:
      "Read top to bottom. Asymmetric crypto appears exactly once — to prove identity and agree on a session key. Everything after runs on fast symmetric AES.",
    chart: `sequenceDiagram
    participant B as Browser
    participant S as Server
    Note over B,S: — ASYMMETRIC PHASE (slow, runs once) —
    B->>S: ClientHello (supported ciphers, random)
    S->>B: ServerHello + certificate (public key, CA-signed)
    Note left of B: browser verifies the certificate\nchain against trusted CAs —\nidentity, not secrecy
    B->>S: key exchange (using server's PUBLIC key)
    Note over B,S: both sides now derive the same\nsymmetric SESSION KEY —\nit never travelled in the clear
    Note over B,S: — SYMMETRIC PHASE (fast, everything else) —
    B->>S: HTTP request, AES-encrypted
    S->>B: HTTP response, AES-encrypted
    Note over B,S: ~1000× cheaper per byte than RSA —\nthis is why the hybrid exists`,
    notes: [
      {
        label: "Asymmetric solves distribution, not speed",
        text: "The public key can be handed to anyone — no secret channel needed — which kills the key-distribution problem. But RSA/ECC operations are ~1000× slower than AES, so using them for bulk data would melt the server.",
      },
      {
        label: "The certificate answers a different question",
        text: "Encryption without identity is worthless — you'd be having a perfectly private chat with an attacker. The CA-signed certificate proves WHO owns the public key; the maths then guarantees only that owner can complete the handshake.",
      },
      {
        label: "Session key = best of both worlds",
        text: "One expensive asymmetric exchange bootstraps a cheap symmetric key used for the whole connection. Every dMAT question about 'why does TLS use both kinds' is answered by this one picture.",
      },
    ],
  },
  {
    kind: "mermaid",
    title: "Which crypto tool for which job?",
    caption:
      "The exam gives you a goal; you pick the primitive. Follow the question you're actually being asked.",
    chart: `flowchart TD
    Q["What must be protected?"] --> C1{"keep content secret?"}
    Q --> C2{"detect any change?"}
    Q --> C3{"prove who sent it?"}
    C1 -- "shared secret feasible\n(same team, one channel)" --> SYM["SYMMETRIC (AES)\nfast · one shared key\nn·(n−1)/2 keys for n people"]
    C1 -- "no safe way to\nshare a secret" --> ASYM["ASYMMETRIC (RSA/ECC)\npublic key encrypts,\nprivate key decrypts"]
    C2 --> HASH["HASH (SHA-256)\none-way fingerprint\nno key · integrity only"]
    C3 --> SIG["DIGITAL SIGNATURE\nhash the message, encrypt hash\nwith the sender's PRIVATE key"]
    SIG -.->|"verify with sender's\nPUBLIC key"| ASYM
    SIG -.->|"pins exact content"| HASH

    classDef q fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef tool fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    class Q,C1,C2,C3 q;
    class SYM,ASYM,HASH,SIG tool;`,
    notes: [
      {
        label: "Hashes hide nothing",
        text: "A SHA-256 checksum next to a download detects corruption or tampering — but the file is in plain sight. Integrity and confidentiality are different goals; mixing them up is the most common trap answer.",
      },
      {
        label: "Signature direction is the tell",
        text: "Encrypting with the RECIPIENT's public key = secrecy (only they can read it). Encrypting a hash with YOUR OWN private key = signature (anyone can verify it was you). Same maths, opposite direction, different goal.",
      },
      {
        label: "The key-count argument",
        text: "10 people with pairwise symmetric secrecy need 45 keys (n·(n−1)/2); with asymmetric crypto they need 10 key pairs. When a question mentions 'how many keys', it's steering you to this contrast.",
      },
    ],
  },
];
