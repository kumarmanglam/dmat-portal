// ============================================================
// Client for the /api/progress serverless function. Availability
// is detected at runtime: on `npm run dev` (no /api) or when the
// server lacks Firebase credentials, the app silently stays in
// localStorage-only mode — nothing breaks.
// ============================================================
import type { ProgressState } from "./types";
import { credsFor } from "./auth";

function headers(userKey: string): Record<string, string> {
  const creds = credsFor(userKey);
  return {
    "Content-Type": "application/json",
    "x-dmat-user": creds?.username ?? "",
    "x-dmat-pass": creds?.password ?? "",
  };
}

export async function fetchRemote(
  userKey: string
): Promise<{ available: boolean; state: ProgressState | null }> {
  try {
    const res = await fetch("/api/progress", { headers: headers(userKey) });
    if (!res.ok) return { available: false, state: null };
    const json = (await res.json()) as { state: ProgressState | null };
    return { available: true, state: json.state ?? null };
  } catch {
    return { available: false, state: null };
  }
}

export async function pushRemote(userKey: string, state: ProgressState): Promise<boolean> {
  try {
    const res = await fetch("/api/progress", {
      method: "PUT",
      headers: headers(userKey),
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}
