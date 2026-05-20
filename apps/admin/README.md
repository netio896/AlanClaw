# apps/admin

AlanClaw expert catalog management prototype.

This is a local, static admin surface for reviewing the v1 expert catalog before a real backend exists.

## Files

- `index.html` renders the admin shell.
- `styles.css` defines the desktop-first management UI with mobile fallbacks.
- `app.js` handles search, filtering, editor preview, and validation summaries.
- `expert-data.js` is generated from `scripts/generate_expert_catalog.mjs`.

## Scope

The prototype can inspect and validate the catalog, but it does not write changes back to disk. Real save/import/export behavior should be added later through a small local Node service or a proper admin backend.

