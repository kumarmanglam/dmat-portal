// ============================================================
// Vercel serverless function: GET/PUT progress per user.
//
// Works like aws-learn-app: the Firebase Admin SDK writes to
// Firestore server-side with service-account credentials, so NO
// security-rules deploy and NO auth provider setup is needed.
//
// Required env vars on Vercel (same values as aws-learn-app's
// .env.local — Firebase Console -> Project settings -> Service
// accounts -> Generate new private key):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//
// Robustness notes:
//   - firebase-admin is loaded via dynamic import INSIDE the try
//     block, so a module-load or credential error returns a readable
//     JSON 500 instead of crashing the function (FUNCTION_INVOCATION_
//     FAILED). Only `import type` is used at the top level (erased at
//     compile), so the module itself never fails to load.
//   - The private key is normalised for the two common paste mistakes:
//     surrounding quotes, and literal "\n" instead of real newlines.
//   - Requests authenticate with the portal's app-level users via
//     x-dmat-user / x-dmat-pass headers.
// ============================================================
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Firestore } from "firebase-admin/firestore";

const USERS: Record<string, string> = {
  "kumar.m": "securehigh",
  "varsha.k": "securehigh",
};

let cachedDb: Firestore | null = null;

function normalizeKey(raw?: string): string | undefined {
  if (!raw) return raw;
  let k = raw.trim();
  // strip an accidental pair of surrounding quotes
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }
  // turn literal "\n" sequences into real newlines
  return k.replace(/\\n/g, "\n");
}

async function getDb(): Promise<Firestore> {
  if (cachedDb) return cachedDb;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizeKey(process.env.FIREBASE_PRIVATE_KEY);
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing service-account env vars (projectId:${Boolean(projectId)} ` +
        `clientEmail:${Boolean(clientEmail)} privateKey:${Boolean(privateKey)}). ` +
        `Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY on Vercel.`
    );
  }

  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  cachedDb = getFirestore(app);
  return cachedDb;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = String(req.headers["x-dmat-user"] ?? "");
  const pass = String(req.headers["x-dmat-pass"] ?? "");
  if (!USERS[user] || USERS[user] !== pass) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // Safe post-auth diagnostic: GET /api/progress?debug=1 reports which
  // env vars are present (booleans only — never their values).
  if (req.method === "GET" && req.query.debug) {
    return res.status(200).json({
      env: {
        FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
        FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
      },
    });
  }

  try {
    const store = await getDb();
    const ref = store.collection("dmatProgress").doc(user);

    if (req.method === "GET") {
      const snap = await ref.get();
      return res.status(200).json({ state: snap.exists ? snap.data() : null });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const state = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!state || typeof state !== "object" || typeof state.updatedAt !== "number") {
        return res.status(400).json({ error: "invalid state payload" });
      }
      await ref.set(state);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, PUT, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    // Personal 2-user tool: surface the real reason to authenticated
    // callers so misconfiguration is diagnosable from the response.
    return res.status(500).json({
      error: "server error",
      detail: e instanceof Error ? e.message : String(e),
    });
  }
}
