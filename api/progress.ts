// ============================================================
// Vercel serverless function: GET/PUT progress per user.
//
// Works like aws-learn-app: the Firebase Admin SDK writes to
// Firestore server-side with service-account credentials, so NO
// security-rules deploy and NO auth provider setup is needed.
//
// Required env vars on Vercel (same values as aws-learn-app):
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//
// Requests authenticate with the portal's app-level users via
// x-dmat-user / x-dmat-pass headers.
// ============================================================
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const USERS: Record<string, string> = {
  "kumar.m": "securehigh",
  "varsha.k": "securehigh",
};

function db(): Firestore | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // literal "\n" sequences in the env var become real newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  const app =
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  return getFirestore(app);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = String(req.headers["x-dmat-user"] ?? "");
  const pass = String(req.headers["x-dmat-pass"] ?? "");
  if (!USERS[user] || USERS[user] !== pass) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const store = db();
  if (!store) {
    return res.status(503).json({
      error:
        "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set — running local-only",
    });
  }

  const ref = store.collection("dmatProgress").doc(user);
  try {
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
  } catch {
    return res.status(500).json({ error: "firestore error" });
  }
}
