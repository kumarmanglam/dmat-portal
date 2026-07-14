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

## Login & users

The portal is gated by a login screen with two hardcoded users (client-side
check — a convenience gate for separating progress, not real security):

| Username | Password |
|---|---|
| `kumar.m` | `securehigh` |
| `varsha.k` | `securehigh` |

All tracking — topic completion, question answers, mock attempts, last topic —
is **per user**. Sessions survive reloads; Sign out lives in the sidebar.
Users are defined in `src/lib/auth.tsx`.

## Progress persistence

- **Always**: localStorage (`dmat-portal-progress-v1:<username>`) — survives visits with zero setup. Progress recorded before the login feature is auto-migrated to `kumar.m`.
- **DB sync via `/api/progress`** (a Vercel serverless function in `api/progress.ts`):
  the browser calls the API with the portal login credentials; the API writes to
  Firestore at `dmatProgress/{username}` using the **Firebase Admin SDK** — the
  same model as aws-learn-app, so **no security-rules deploy and no auth-provider
  setup** are needed. It activates as soon as the three service-account env vars
  are set on Vercel (see `.env.example`). Newest snapshot (by `updatedAt`) wins
  on load; writes are debounced. Without the env vars — or on plain `npm run dev`,
  which has no `/api` — the app runs in local-only mode (sidebar badge shows which).

## Link from aws-learn-app

The old app's top nav has a 🎓 button that opens this portal in a new tab.
It points at `NEXT_PUBLIC_DMAT_PORTAL_URL` (defaults to `http://localhost:5173`) —
set that env var in `aws-learn-app/.env.local` when you deploy the portal.

## Deploying statically

`npm run build` → `dist/`. The router uses history URLs (`/learn/trees`), so the
host needs an SPA fallback to `index.html`:

- **Vercel**: `vercel.json` (included) rewrites all routes to `/index.html`.
- **Firebase Hosting**: `firebase.json` (included) has the same rewrite.
- **Netlify**: add `public/_redirects` with `/* /index.html 200`.

### Enabling DB sync on Vercel

Project → Settings → Environment Variables → add the three service-account vars
(same values as `aws-learn-app/.env.local`):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (paste the PEM with literal `\n` sequences)

Then redeploy. That's it — the Admin SDK bypasses Firestore security rules, so
nothing needs enabling or deploying in the Firebase console. When active, the
sidebar badge reads “db: synced” and the network tab shows `/api/progress` calls.
