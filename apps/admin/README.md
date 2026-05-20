# apps/admin

AlanClaw expert catalog management prototype.

This is a local, static admin surface for reviewing the v1 expert catalog before a real backend exists.

## Files

- `index.html` renders the admin shell.
- `styles.css` defines the desktop-first management UI with mobile fallbacks.
- `app.js` handles search, filtering, editor preview, and validation summaries.
- `server.mjs` serves the local admin API and static files.
- `expert-data.js` is generated from `scripts/generate_expert_catalog.mjs`.

## Scope

The admin can run in two modes:

- Static mode: open `index.html` or serve this folder with any static server. You can inspect and preview, but save is disabled.
- Local service mode: run `node apps/admin/server.mjs` from the repo root and open `http://127.0.0.1:4176/`. Save is enabled.

## Local Service

The local service exposes:

- `GET /api/experts`
- `POST /api/experts`
- `GET /api/health`

Saving writes `data/experts/alanclaw-experts.json`, then regenerates:

- `data/experts/alanclaw-experts.csv`
- `apps/web/expert-data.js`
- `apps/admin/expert-data.js`
- `content/experts/*.md`

This is still a local development tool. It does not include login, permissions, or multi-user locking.
