import type { TopicVisual } from "./types";

// Bipartite mapping: four classic attack scenarios on the left,
// the four CIA+A goals on the right. Solid animated edges mark the
// PRIMARY violation; dashed edges are instructive knock-on effects
// that the word 'primarily' exists to rule out.
export const SECURITY_GOALS_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Which goal did the attacker actually break?",
      flow: "free",
      caption:
        "Left: four attack scenarios. Right: the CIA+A goals. Solid arrows = the PRIMARY violation; dashed arrows = knock-on effects that 'primarily' rules out. Run the walkthrough to learn the mapping method.",
      legend: [
        { swatch: "blue", text: "Confidentiality — no unauthorised reading" },
        { swatch: "accent", text: "Integrity — no unauthorised changes" },
        { swatch: "green", text: "Authenticity — identities are verifiable" },
        { swatch: "danger", text: "Availability — service usable when needed" },
      ],
      nodes: [
        {
          id: "sqli",
          label: "SQL injection",
          desc: "dumps the user table",
          detail:
            "An injection flaw lets the attacker read the full user table — emails and password hashes included. Nothing was modified and the site keeps serving; data that should have been private was simply READ.",
          x: 60,
          y: 20,
          kind: "muted",
        },
        {
          id: "deface",
          label: "Defacement",
          desc: "replaces the homepage",
          detail:
            "Attackers overwrite the homepage with their own banner overnight. The site remains perfectly reachable and no secret data leaked — content the owner controls was CHANGED without authorisation.",
          x: 60,
          y: 170,
          kind: "muted",
        },
        {
          id: "phish",
          label: "Phished CEO login",
          desc: "stolen credentials used",
          detail:
            "Using phished credentials, the attacker logs into the CEO's account and issues payment instructions from it. The system dutifully accepts the login — it can no longer tell that 'CEO account' does not mean the CEO.",
          x: 60,
          y: 320,
          kind: "muted",
        },
        {
          id: "ddos",
          label: "DDoS flood",
          desc: "ticket shop unreachable",
          detail:
            "A botnet floods the ticket shop with junk requests on launch day; legitimate buyers get timeouts. No data is read, nothing is altered, no identity is faked — the service simply cannot serve.",
          x: 60,
          y: 470,
          kind: "muted",
        },
        {
          id: "conf",
          label: "Confidentiality",
          desc: "only authorised eyes READ",
          detail:
            "Data is visible only to authorised parties. Violated by breaches, leaks and sniffing — the tell is that something secret was READ, even if nothing was changed and the service stayed up.",
          x: 560,
          y: 20,
          kind: "blue",
        },
        {
          id: "integ",
          label: "Integrity",
          desc: "nothing CHANGED unnoticed",
          detail:
            "Data and system behaviour stay unmodified except by authorised parties. Violated by tampering, defacement and malware that alters behaviour — the tell is an unauthorised CHANGE, regardless of whether anyone read anything.",
          x: 560,
          y: 170,
          kind: "accent",
        },
        {
          id: "auth",
          label: "Authenticity",
          desc: "identities can be TRUSTED",
          detail:
            "The system can verify WHO it is talking to. Violated by spoofing, session hijacking and stolen credentials used to log in — the tell is the system trusting the wrong identity, even if nothing is leaked or altered yet.",
          x: 560,
          y: 320,
          kind: "green",
        },
        {
          id: "avail",
          label: "Availability",
          desc: "service USABLE when needed",
          detail:
            "The service is reachable by legitimate users when they need it. Violated by DoS/DDoS and ransomware's lockout side — the tell is denial of access with nothing read and nothing changed.",
          x: 560,
          y: 470,
          kind: "danger",
        },
      ],
      edges: [
        { id: "p-sqli", from: "sqli", to: "conf", label: "data read", animated: true },
        { id: "p-deface", from: "deface", to: "integ", label: "content changed", animated: true },
        { id: "p-phish", from: "phish", to: "auth", label: "wrong identity trusted", animated: true },
        { id: "p-ddos", from: "ddos", to: "avail", label: "access denied", animated: true },
        { id: "k-phish", from: "phish", to: "conf", label: "knock-on", dashed: true },
        { id: "k-sqli", from: "sqli", to: "auth", label: "knock-on", dashed: true },
      ],
      steps: [
        {
          title: "The method: name the achievement, not the technique",
          text: "Every scenario on the left is answered by one question: what did the attacker actually ACHIEVE the moment the attack succeeded? Not which tool they used, not which vulnerability they exploited — techniques are interchangeable costumes. Read something secret, change something, get trusted as someone else, or deny access: those four achievements are the four goals on the right.",
          focus: ["sqli", "deface", "phish", "ddos"],
        },
        {
          title: "SQL injection → Confidentiality",
          text: "The injection dumped the user table: private data was READ by an unauthorised party, and that is the whole achievement — nothing was modified, the site kept serving. Notice that 'SQL injection' the technique tells you nothing; the same technique aimed at UPDATE statements would violate integrity instead. The dashed knock-on hints at the future: stolen password hashes may later enable impersonation, but that is a second attack, not this one.",
          focus: ["sqli", "conf"],
          edgeFocus: ["p-sqli", "k-sqli"],
        },
        {
          title: "Defacement → Integrity — and the availability trap",
          text: "The homepage was replaced: content was CHANGED without authorisation, the definition of an integrity violation. The trap in this scenario is the phrase 'the site stays reachable' — it is there to tempt you toward availability, and it does the opposite: it certifies availability is intact. Nothing secret leaked either; one goal was hit, cleanly.",
          focus: ["deface", "integ"],
          edgeFocus: ["p-deface"],
        },
        {
          title: "Phished login → Authenticity — 'primarily' earns its keep",
          text: "Once the attacker logs in as the CEO, the system's identity check is broken: 'CEO account' no longer means the CEO — that is authenticity, violated at the instant of login. Yes, the attacker can now READ the CEO's mail (dashed knock-on to confidentiality), but that is a downstream consequence available only BECAUSE the identity check failed first. 'Primarily' points at the most direct violation, and the most direct one here is the trusted-but-false identity.",
          focus: ["phish", "auth", "conf"],
          edgeFocus: ["p-phish", "k-phish"],
        },
        {
          title: "DDoS → Availability",
          text: "The flood reads nothing and changes nothing; no identity is faked. Its entire achievement is that legitimate buyers cannot use the service — denial of access, the pure availability violation. This is the cleanest mapping of the four: when a scenario touches no data at all, availability is usually the only goal left standing.",
          focus: ["ddos", "avail"],
          edgeFocus: ["p-ddos"],
        },
        {
          title: "The exam recipe",
          text: "Three moves, every time: strip the technique (injection, phishing, botnet — ignore it), name the attacker's direct achievement (read / changed / impersonated / denied), and pick the goal that achievement violates most DIRECTLY. When several goals seem plausible, the word 'primarily' in the question is doing the work — knock-on effects like the dashed edges are real, but they are consequences, and consequences never outrank the first domino.",
          focus: ["conf", "integ", "auth", "avail"],
          edgeFocus: ["p-sqli", "p-deface", "p-phish", "p-ddos"],
        },
      ],
    },
  },
];
