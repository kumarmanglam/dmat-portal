// ============================================================
// App-level login for the two known users. NOTE: credentials
// checked client-side in a static SPA are a convenience gate to
// separate the two users' progress — not real security (anyone
// with the JS bundle can read them). Fine for a personal tool.
// ============================================================
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UserDef {
  username: string;
  password: string;
  displayName: string;
}

const USERS: UserDef[] = [
  { username: "kumar.m", password: "securehigh", displayName: "Kumar M" },
  { username: "varsha.k", password: "securehigh", displayName: "Varsha K" },
];

const SESSION_KEY = "dmat-portal-session-v1";

function loadSession(): string | null {
  try {
    const u = localStorage.getItem(SESSION_KEY);
    return USERS.some((x) => x.username === u) ? u : null;
  } catch {
    return null;
  }
}

interface AuthApi {
  user: string | null; // username, doubles as the progress key
  displayName: string;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(loadSession);

  const api = useMemo<AuthApi>(
    () => ({
      user,
      displayName: USERS.find((u) => u.username === user)?.displayName ?? "",
      login: (username, password) => {
        const match = USERS.find(
          (u) => u.username === username.trim().toLowerCase() && u.password === password
        );
        if (!match) return false;
        try {
          localStorage.setItem(SESSION_KEY, match.username);
        } catch {
          /* private mode — session just won't survive reloads */
        }
        setUser(match.username);
        return true;
      },
      logout: () => {
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          /* ignore */
        }
        setUser(null);
      },
    }),
    [user]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
