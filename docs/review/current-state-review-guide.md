# AlanClaw Current State Review Guide

This guide is for reviewing the current AlanClaw local prototype after the expert catalog, admin workflow, and industry Agent Team template work.

## Review Scope

Review the project as a content-first local prototype, not as a production SaaS app.

The current product surface includes:

- A mobile-first expert marketplace in `apps/web`.
- A local expert admin tool in `apps/admin`.
- A canonical expert catalog in `data/experts`.
- Industry Agent Team templates in `data/team-templates`.
- A local Node service that serves Admin, Web, and API routes.

## Expected Local Commands

```powershell
npm run dev
npm run generate
npm run smoke
```

Expected local URLs:

```text
Admin: http://127.0.0.1:4176/
Web:   http://127.0.0.1:4176/web/index.html
```

## Current Acceptance Baseline

`npm run smoke` should pass these checks:

- `GET /api/health`
- `GET /api/experts` returns 18 experts.
- `GET /api/team-templates` returns 3 templates.
- `GET /` serves Admin.
- `GET /web/index.html` serves Web.
- `GET /web/expert-data.js`
- `GET /web/team-data.js`
- `GET /api/export/json`
- `GET /api/export/csv`
- `POST /api/import/preview`
- `POST /api/experts`

## Product Review Checklist

- Confirm the positioning is clear: Myanmar-focused AI Agent marketplace.
- Confirm the product direction is now industry Agent Teams, not only single experts.
- Check whether the first three team templates are useful enough:
  - Construction
  - Ecommerce
  - Social Media Marketing
- Check whether each team member has a clear role and reason.
- Check if the expert names, categories, and descriptions feel appropriate for Myanmar users.
- Identify missing first-batch industries that should be added before a public demo.

## Web Review Checklist

- Open `http://127.0.0.1:4176/web/index.html`.
- Confirm expert browsing works:
  - Recommended / Hot / Latest tabs.
  - Category chips.
  - Search.
  - Expert detail sheet.
  - Add expert to My Experts.
- Confirm industry team browsing works:
  - Switch from Expert Marketplace to Industry Teams.
  - Open Construction team detail.
  - Confirm member roles render.
  - Add whole team.
  - Confirm saved state updates.
- Check mobile layout first, then desktop width.
- Watch for text overflow, unclear labels, and awkward Chinese copy.

## Admin Review Checklist

- Open `http://127.0.0.1:4176/`.
- Confirm the 18-expert catalog loads.
- Edit one non-critical field and verify the diff panel changes.
- Do not save unless intentionally testing local write behavior.
- Test JSON export and CSV export.
- Test import preview with a valid exported JSON or CSV.
- Confirm validation blocks bad catalog shape.
- Confirm team templates are visible in the right panel.

## Data Review Checklist

Expert source of truth:

```text
data/experts/alanclaw-experts.json
```

Team template source of truth:

```text
data/team-templates/alanclaw-team-templates.json
```

Check:

- Expert slugs are stable kebab-case.
- `sort_order` is unique.
- Required text fields are non-empty.
- Array fields are real arrays in JSON.
- Team templates reference existing expert slugs.
- Team template roles are concrete, not vague.

## API Review Checklist

Routes to inspect:

```text
GET  /api/health
GET  /api/experts
POST /api/experts
GET  /api/export/json
GET  /api/export/csv
POST /api/import/preview
GET  /api/team-templates
```

Review focus:

- Request body size limit.
- Validation before writes.
- Static file path safety.
- CSV export/import compatibility.
- Whether API names should change before production.

## Known Gaps

- Team templates are not editable in Admin yet.
- There is no schema file for team templates yet.
- There is no database, auth, user account, or deployment pipeline.
- The Web app uses local browser storage for My Experts.
- The local Admin service writes directly to repo files.
- No real multi-Agent orchestration exists yet.
- Generated data files are committed for static preview convenience.

## Reviewer Decision Points

Recommended next decision:

Should AlanClaw v2 focus on team-template management or on a guided industry onboarding flow?

Options:

- Admin Team Template Editor: best for content operations and reviewer-controlled iteration.
- Guided Industry Onboarding: best for product demo and user-facing validation.
- Schema/Test Hardening: best before inviting more contributors.

Current recommendation:

Build the Admin Team Template Editor next, because it turns the new core product concept into manageable content instead of hardcoded JSON.
