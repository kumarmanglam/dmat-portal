// ============================================================
// Progress store: React context over localStorage with optional
// Firestore write-through (debounced). localStorage is written
// synchronously on every change, so state always persists across
// visits even with no Firebase configured.
//
// Storage is PER USER: the logged-in username keys both the
// localStorage bucket and the Firestore doc (dmatProgress/{user}),
// so kumar.m and varsha.k each have independent progress.
// ============================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_PROGRESS, type MockAttempt, type ProgressState } from "./types";
import { fetchRemote, pushRemote } from "./api";
import { TOPICS } from "./topics";

const LS_PREFIX = "dmat-portal-progress-v1";
const lsKey = (userKey: string) => `${LS_PREFIX}:${userKey}`;

function loadLocal(userKey: string): ProgressState {
  try {
    let raw = localStorage.getItem(lsKey(userKey));
    // One-time migration: progress saved before login existed
    // (un-suffixed key) belongs to kumar.m.
    if (!raw && userKey === "kumar.m") {
      const legacy = localStorage.getItem(LS_PREFIX);
      if (legacy) {
        localStorage.setItem(lsKey(userKey), legacy);
        localStorage.removeItem(LS_PREFIX);
        raw = legacy;
      }
    }
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as ProgressState) };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function saveLocal(userKey: string, state: ProgressState) {
  try {
    localStorage.setItem(lsKey(userKey), JSON.stringify(state));
  } catch {
    /* storage full/blocked — app still works in-memory */
  }
}

export type SyncStatus = "local" | "connecting" | "synced" | "error";

interface ProgressApi {
  state: ProgressState;
  sync: SyncStatus;
  setTopicComplete: (topicId: string, done: boolean) => void;
  setLastTopic: (topicId: string) => void;
  recordTopicAnswer: (topicId: string, qIndex: number, chosen: number) => void;
  saveMockAttempt: (attempt: MockAttempt) => void;
  completedCount: number;
  overallPct: number;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({
  userKey,
  children,
}: {
  userKey: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<ProgressState>(() => loadLocal(userKey));
  const [sync, setSync] = useState<SyncStatus>("connecting");
  const apiRef = useRef(false); // /api/progress reachable + configured
  const pushTimer = useRef<number | null>(null);

  // Probe the progress API once and merge this user's remote snapshot.
  // On `npm run dev` (no /api) or missing server credentials the app
  // stays in localStorage-only mode.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { available, state: remote } = await fetchRemote(userKey);
      if (cancelled) return;
      if (!available) {
        setSync("local");
        return;
      }
      apiRef.current = true;
      setState((local) => {
        // newest snapshot wins
        if (remote && remote.updatedAt > local.updatedAt) {
          saveLocal(userKey, remote);
          return remote;
        }
        if (local.updatedAt > 0) void pushRemote(userKey, local);
        return local;
      });
      setSync("synced");
    })();
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  const commit = useCallback(
    (updater: (prev: ProgressState) => ProgressState) => {
      setState((prev) => {
        const next = { ...updater(prev), updatedAt: Date.now() };
        saveLocal(userKey, next);
        if (apiRef.current) {
          if (pushTimer.current) window.clearTimeout(pushTimer.current);
          pushTimer.current = window.setTimeout(async () => {
            const ok = await pushRemote(userKey, next);
            setSync(ok ? "synced" : "error");
          }, 800);
        }
        return next;
      });
    },
    [userKey]
  );

  const api = useMemo<ProgressApi>(() => {
    const completedCount = Object.keys(state.completedTopics).length;
    return {
      state,
      sync,
      completedCount,
      overallPct: Math.round((completedCount / TOPICS.length) * 100),
      setTopicComplete: (topicId, done) =>
        commit((p) => {
          const completedTopics = { ...p.completedTopics };
          if (done) completedTopics[topicId] = new Date().toISOString();
          else delete completedTopics[topicId];
          return { ...p, completedTopics };
        }),
      setLastTopic: (topicId) =>
        commit((p) => (p.lastTopic === topicId ? p : { ...p, lastTopic: topicId })),
      recordTopicAnswer: (topicId, qIndex, chosen) =>
        commit((p) => ({
          ...p,
          topicAnswers: {
            ...p.topicAnswers,
            [topicId]: { ...(p.topicAnswers[topicId] ?? {}), [qIndex]: chosen },
          },
        })),
      saveMockAttempt: (attempt) =>
        commit((p) => ({ ...p, mockAttempts: [...p.mockAttempts, attempt].slice(-10) })),
    };
  }, [state, sync, commit]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProgress outside ProgressProvider");
  return v;
}
