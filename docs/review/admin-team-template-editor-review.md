# Admin Team Template Editor v1 Review

## Scope

Admin Team Template Editor v1 turns industry Agent Team templates from read-only JSON previews into editable local content.

It does not add:

- Login, permissions, database, or deployment.
- Real multi-Agent orchestration.
- Changes to the existing expert import/export/diff/save workflow.

## Source And Generated Files

Source of truth:

```text
data/team-templates/alanclaw-team-templates.json
```

Generated static data:

```text
apps/web/team-data.js
apps/admin/team-data.js
```

Generation still runs through:

```powershell
npm run generate
```

## API

```text
GET  /api/team-templates
POST /api/team-templates/preview
POST /api/team-templates
```

`POST /api/team-templates/preview` validates and returns diff only. It does not write files.

`POST /api/team-templates` validates, writes `data/team-templates/alanclaw-team-templates.json`, and regenerates Web/Admin `team-data.js`.

## Validation Rules

- Team template `slug` must be unique.
- `sort_order` must be unique.
- `title`, `industry`, and `card_summary` must be non-empty.
- `use_cases` must be a non-empty array.
- `recommended_experts` must be a non-empty array.
- Every `recommended_experts[].slug` must exist in the 18-expert catalog.
- Every recommended member needs `role` and `reason`.
- `languages_supported` and `channels_supported` must be non-empty arrays.

## Admin Review Checklist

- Open `http://127.0.0.1:4176/`.
- Scroll to “行业 Agent Team 模板编辑器”.
- Select each team template from the left list.
- Edit a non-critical field and confirm the right-side diff changes.
- Edit a member role/reason and confirm validation remains green.
- Try an invalid expert slug and confirm validation blocks save.
- Click reload to restore from disk.
- Save unchanged original data and confirm no expert workflow is affected.

## Smoke Baseline

`npm run smoke` should include:

- `GET /api/team-templates`
- `POST /api/team-templates/preview`
- `POST /api/team-templates`
- `GET /web/team-data.js`
- `GET /team-data.js`

The original expert smoke checks should still pass.

## Known Limits

- No create/delete team template controls yet.
- Member editing is row-based and text-first, not a polished drag/drop builder.
- Team templates still use local files, not a database.
- Web consumes generated `team-data.js`; it does not call the API at runtime.
