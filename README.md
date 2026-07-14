# dMAT Portal — Computer Science Prep

Standalone single-page app (Vite + React + TypeScript) for preparing the
**dMAT (Digital Master Assessment Test), Computer Science track**. Completely
independent from `aws-learn-app` — its own routes, state and logic.

## Run

```powershell
cd dmat-portal
npm install
npm run dev        # http://localhost:5173
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard: exam facts, syllabus coverage %, Start Mock Exam, Continue Learning |
| `/exam-details` | Static reference: module structure, timing, scoring, logistics, FAQ |
| `/learn/:topic` | One page per topic (20 topics): mental-model concept → dMAT-style questions → mark complete |
| `/tracker` | Coverage checklist with per-module + overall progress bars |
| `/mock-exam` | ONE full mock: Figure Sequences 20×25min, Equations 20×25min, Latin Squares 16×20min, 30min break, Subject Module 24×90min. Timed, skippable, no negative marking |

The Core Module mock items (figure sequences, equation systems, latin squares)
are **generated deterministically from fixed seeds** — every attempt is the same
paper, and generated learn-page drills use different seeds so they never leak
mock content.

## Progress persistence

- **Always**: localStorage (`dmat-portal-progress-v1`) — survives visits with zero setup.
- **Optional Firebase sync** (question/answer tracking + completion across devices):
  1. Firebase Console → Project settings → add a **Web app**, copy the config.
  2. Copy `.env.example` → `.env` and fill `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
  3. Firebase Console → Authentication → Sign-in method → enable **Anonymous**.
  4. Deploy the updated rules (already added in `aws-learn-app/firestore.rules`):
     `firebase deploy --only firestore:rules` from `aws-learn-app`.

  Data lives at `dmatProgress/{uid}` — one doc per anonymous browser identity;
  newest snapshot (by `updatedAt`) wins on load, writes are debounced.

## Link from aws-learn-app

The old app's top nav has a 🎓 button that opens this portal in a new tab.
It points at `NEXT_PUBLIC_DMAT_PORTAL_URL` (defaults to `http://localhost:5173`) —
set that env var in `aws-learn-app/.env.local` when you deploy the portal.

## Deploying statically

`npm run build` → `dist/`. The router uses history URLs (`/learn/trees`), so the
host needs an SPA fallback to `index.html` (Netlify `_redirects`, Vercel default,
or Firebase Hosting `rewrites`).
