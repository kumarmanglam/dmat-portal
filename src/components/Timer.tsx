import { useEffect, useState } from "react";

// Countdown against an absolute deadline (epoch ms) — immune to
// re-render drift. Calls onExpire exactly once.
export function Timer({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const [left, setLeft] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    setLeft(Math.max(0, deadline - Date.now()));
    const id = window.setInterval(() => {
      const rest = Math.max(0, deadline - Date.now());
      setLeft(rest);
      if (rest <= 0) {
        window.clearInterval(id);
        onExpire();
      }
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  const totalSec = Math.ceil(left / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const low = totalSec <= 120;
  return (
    <span className={`timerbox${low ? " low" : ""}`}>
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}
