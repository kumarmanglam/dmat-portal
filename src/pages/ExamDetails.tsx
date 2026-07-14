import { SectionHeading } from "../components/bits";

export function ExamDetails() {
  return (
    <div>
      <SectionHeading
        eyebrow="Static reference"
        title="Exam Details"
        sub="Structure, timing, scoring and logistics of the dMAT — compiled from the official preparatory materials."
      />

      <h2 style={{ fontSize: "1.3rem", marginTop: 28 }}>Module structure</h2>
      <div className="timeline" style={{ margin: "12px 0 8px" }}>
        <div className="tl-block tl-core">Core Module<small>90 min</small></div>
        <div className="tl-block tl-break">Break<small>30 min</small></div>
        <div className="tl-block tl-subject">Subject Module<small>90 min</small></div>
      </div>

      <table className="ref">
        <thead>
          <tr><th>Component</th><th>Task type</th><th>Tasks</th><th>Time</th><th>Pace</th></tr>
        </thead>
        <tbody>
          <tr><td>Core · Subtest 1</td><td>Figure Sequences</td><td className="num">20</td><td className="num">25 min</td><td className="num">~75 s/item</td></tr>
          <tr><td>Core · Subtest 2</td><td>Mathematical Equations</td><td className="num">20</td><td className="num">25 min</td><td className="num">~75 s/item</td></tr>
          <tr><td>Core · Subtest 3</td><td>Latin Squares</td><td className="num">16</td><td className="num">20 min</td><td className="num">~75 s/item</td></tr>
          <tr><td>Subject Module</td><td>Input text + single-choice (CS)</td><td className="num">varies</td><td className="num">90 min</td><td className="num">—</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
        The three Core subtests sum to 70 of the module's 90 minutes — the rest covers per-subtest
        instructions and transitions.
      </p>

      <h2 style={{ fontSize: "1.3rem", marginTop: 32 }}>Core subtests at a glance</h2>
      <div className="grid3" style={{ marginTop: 12 }}>
        <div className="card">
          <h3 style={{ fontSize: "1rem", display: "flex", gap: 8, alignItems: "center" }}>Figure Sequences <span className="chip">20 × 75s</span></h3>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.86rem" }}>
            Symbols move, rotate and change colour by fixed rules; predict the next two matrices.
            Movement can accelerate by x + 1; at borders symbols bounce off or slide along.
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", display: "flex", gap: 8, alignItems: "center" }}>Math Equations <span className="chip">20 × 75s</span></h3>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.86rem" }}>
            Letter systems, all unknowns integers 1–20 with exactly one solution. Mental
            substitution speed — no paper allowed.
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem", display: "flex", gap: 8, alignItems: "center" }}>Latin Squares <span className="chip">16 × 75s</span></h3>
          <p style={{ color: "var(--ink-soft)", fontSize: "0.86rem" }}>
            5×5 grid, letters A–E once per row and column; deduce the marked cell through chained
            forced moves.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.3rem", marginTop: 32 }}>Subject Module — Computer Science</h2>
      <p className="sub" style={{ fontSize: "0.92rem" }}>
        Text-based inputs (may include figures, tables, formulas) followed by single-choice questions,
        four options each. Application-oriented, not recall. Domains: theoretical CS, software
        engineering &amp; data structures, databases, networks &amp; security, operating systems.
      </p>

      <h2 style={{ fontSize: "1.3rem", marginTop: 32 }}>Logistics &amp; scoring</h2>
      <table className="ref">
        <tbody>
          <tr><td>Format</td><td>Computer-based, single-choice throughout</td></tr>
          <tr><td>Scoring</td><td className="num">0–200 scale, mean 100; core + subject scores</td></tr>
          <tr><td>Negative marking</td><td>None — always guess rather than leave blank</td></tr>
          <tr><td>Aids</td><td>No notes, no scratch paper, no calculator at any point</td></tr>
          <tr><td>Fee</td><td className="num">€150, paid online</td></tr>
          <tr><td>Evaluation</td><td>Centralised at the TestDaF Institute, Bochum</td></tr>
          <tr><td>Validity</td><td>Lifetime</td></tr>
          <tr><td>Where it fits</td><td>Inside the APS process, before the APS certificate</td></tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: "1.3rem", marginTop: 32 }}>Quick FAQ</h2>
      <details className="faq">
        <summary>Is there an official syllabus?</summary>
        <p>
          Not in the traditional sense. The Core Module tests fixed cognitive task types; the Subject
          Module tests applied Bachelor's fundamentals. The closest thing is the official g.a.s.t.
          preparatory materials with instructions and tiered practice exercises.
        </p>
      </details>
      <details className="faq">
        <summary>Should I guess when unsure?</summary>
        <p>Yes — always. No negative marking means any guess beats a blank.</p>
      </details>
      <details className="faq">
        <summary>Which Subject Module will I get?</summary>
        <p>
          The one matching your Bachelor's field group — Computer Science here. Other field modules
          follow the same input-text + single-choice template.
        </p>
      </details>
      <details className="faq">
        <summary>Can I take notes or use a calculator?</summary>
        <p>No. No helping tools are permitted at any point — train that way too.</p>
      </details>

      <div className="note" style={{ marginTop: 20 }}>
        Registration windows, centre lists and eligibility change per cycle — cross-check{" "}
        <span className="mono">d-mat.de</span> and <span className="mono">aps-india.de</span> before booking.
      </div>
    </div>
  );
}
