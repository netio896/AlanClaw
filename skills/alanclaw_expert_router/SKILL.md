---
name: alanclaw_expert_router
description: "AlanClaw expert router: reads the repository expert catalog and execution map, then returns a plan-only route from expert slug to candidate skill intent. Use when AlanClaw needs to decide which skill should handle an expert task without reading user-level skill directories or executing external services."
metadata:
  openclaw:
    skillKey: alanclaw_expert_router
    requires:
      bins: ["node"]
---

# AlanClaw Expert Router

This skill is the repository-local routing entry for AlanClaw. It reads only AlanClaw repository data and returns a routing plan. It does not read user-level skill directories, execute Telegram, Facebook, Email, file writes, ads, or third-party actions.

## What It Reads

The router script reads from the AlanClaw repository root:

- `data/experts/alanclaw-experts.json`
- `data/execution/expert-skill-map.json`
- `data/team-templates/alanclaw-team-templates.json`

The mapping file is the execution boundary. Web/Admin still manage experts and team templates; this skill only answers which candidate skill and intent should handle a task.

## Commands

From the AlanClaw repository root:

```powershell
node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --validate --json
```

Route one expert task:

```powershell
node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --expert-slug excel-data-cleanup-expert --task "清洗客户表，统一手机号格式" --files customers.xlsx --json
```

List all mapped experts:

```powershell
node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --list --json
```

Route one industry team:

```powershell
node skills/alanclaw_expert_router/scripts/route-expert-task.mjs --team-slug construction-project-team --task "plan construction project follow-up" --files meeting-notes.docx,boq.xlsx --json
```

## Output Contract

The script returns JSON with:

- `ok`
- `execution_mode`
- `expert`
- `team`
- `route`
- `routes`
- `warnings`
- `next_step`

`execution_mode` is always `plan_only` in this version.

## Safety Boundary

If a route has `requires_external_account: true`, the router must not execute anything. It may only return a warning that the route needs account authorization, user confirmation, logging, and a future execution adapter.

This skill is intentionally conservative: it makes AlanClaw executable in shape without performing real-world side effects.
