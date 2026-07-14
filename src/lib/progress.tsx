// ============================================================
// Progress store: React context over localStorage with optional
// Firestore write-through (debounced). localStorage is written
// synchronously on every change, so state always persists across
// visits even with no Firebase configured.
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
import { fetchRemote, firebaseEnabled, pushRemote, waitForUser } from "./firebase";
import { TOPICS } from "./topics";

const LS_KEY = "dmat-portal-progress-v1";

function loadLocal(): ProgressState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as ProgressState) };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function saveLocal(state: ProgressState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadLocal);
  const [sync, setSync] = useState<SyncStatus>(firebaseEnabled ? "connecting" : "local");
  const uidRef = useRef<string | null>(null);
  const pushTimer = useRef<number | null>(null);

  // Connect to Firebase (if configured) and merge remote state once.
  useEffect(() => {
    if (!firebaseEnabled) return;
    let cancelled = false;
    (async () => {
      const user = await waitForUser();
      if (cancelled) return;
      if (!user) {
        setSync("error");
        return;
      }
      uidRef.current = user.uid;
      const remote = await fetchRemote(user.uid);
      if (cancelled) return;
      setState((local) => {
        // newest snapshot wins
        if (remote && remote.updatedAt > local.updatedAt) {
          saveLocal(remote);
          return remote;
        }
        if (local.updatedAt > 0) void pushRemote(user.uid, local);
        return local;
      });
      setSync("synced");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback((updater: (prev: ProgressState) => ProgressState) => {
    setState((prev) => {
      const next = { ...updater(prev), updatedAt: Date.now() };
      saveLocal(next);
      if (firebaseEnabled && uidRef.current) {
        if (pushTimer.current) window.clearTimeout(pushTimer.current);
        pushTimer.current = window.setTimeout(async () => {
          const ok = await pushRemote(uidRef.current!, next);
          setSync(ok ? "synced" : "error");
        }, 800);
      }
      return next;
    });
  }, []);

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
