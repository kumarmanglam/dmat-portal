// Tiny shared UI pieces.
export function ProgressBar({
  pct,
  color,
}: {
  pct: number;
  color?: "blue" | "green";
}) {
  return (
    <div className={`pbar${color ? " " + color : ""}`}>
      <span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="page-title">{title}</h1>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}
