// ============================================================
// Optional Firebase (client SDK). If the VITE_FIREBASE_* env vars
// are absent, the app runs purely on localStorage — no errors, no
// network calls. When present:
//   - anonymous auth satisfies the security rules
//   - progress lives at dmatProgress/{username} in Firestore,
//     keyed by the app-level login (kumar.m / varsha.k)
// ============================================================
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { ProgressState } from "./types";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let app: FirebaseApp | null = null;
function ensureApp(): FirebaseApp {
  if (!app) app = initializeApp(cfg as Required<typeof cfg>);
  return app;
}

export function waitForUser(): Promise<User | null> {
  if (!firebaseEnabled) return Promise.resolve(null);
  const auth = getAuth(ensureApp());
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) return resolve(user);
      try {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      } catch {
        resolve(null);
      }
    });
  });
}

export async function fetchRemote(userKey: string): Promise<ProgressState | null> {
  try {
    const db = getFirestore(ensureApp());
    const snap = await getDoc(doc(db, "dmatProgress", userKey));
    return snap.exists() ? (snap.data() as ProgressState) : null;
  } catch {
    return null;
  }
}

export async function pushRemote(userKey: string, state: ProgressState): Promise<boolean> {
  try {
    const db = getFirestore(ensureApp());
    await setDoc(doc(db, "dmatProgress", userKey), state, { merge: false });
    return true;
  } catch {
    return false;
  }
}
