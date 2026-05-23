# Open WebUI: AlanClaw BIM Tools Prompt

This document records the Open WebUI prompt used to connect AlanClaw BIM workflows with the `AlanClaw BIM Tools` knowledge base.

## Prompt

- Name: `AlanClaw BIM Tools`
- Command: `/alanbim`
- Status: enabled
- Knowledge base: `#AlanClaw BIM Tools`
- Template file: `integrations/openwebui/prompts/alanbim.prompt.json`
- Knowledge template: `integrations/openwebui/knowledge/alanclaw-bim-tools.knowledge.json`
- Model template: `integrations/openwebui/models/alanclaw-construction-team.model.json`
- Related Codex skill: `skills/alanclaw-bim-tools`

## Purpose

Use `/alanbim` when the user provides:

- IFC Viewer output from `https://huggingface.co/spaces/network01/ifc-hierarchy-viewer`
- Floor Plan Detection output from `https://huggingface.co/spaces/network01/Floor-Plan-Detection`
- A construction, BIM, BOQ, floor-plan, or project webpage link
- A short project brief that needs to be converted into a construction-team prompt

The prompt should route the input into AlanClaw 建筑行业团队 and preserve the engineering safety boundary: counts, dimensions, materials, pricing, contract terms, and safety conclusions must be marked `需人工确认`.

## Migration Steps

1. Open Open WebUI.
2. Go to `Workspace -> Knowledge`.
3. Create or edit a knowledge base named `AlanClaw BIM Tools`.
4. Add the recommended sources listed in `integrations/openwebui/knowledge/alanclaw-bim-tools.knowledge.json`.
5. Go to `Workspace -> Prompts`.
6. Create or edit a prompt named `AlanClaw BIM Tools`.
7. Set command to `/alanbim`.
8. Paste the `content` value from `integrations/openwebui/prompts/alanbim.prompt.json`.
9. Enable the prompt.
10. If using a dedicated model, recreate `AlanClaw Construction Team` from `integrations/openwebui/models/alanclaw-construction-team.model.json`.
11. In chat, type `/alanbim`, then paste IFC Viewer output, Floor Plan Detection output, a webpage link, or a project brief.

## Team Setup URL

For a local Open WebUI install, the knowledge page is usually:

```text
http://127.0.0.1:3000/workspace/knowledge
```

This URL is local to the machine running Open WebUI. For a team server, replace `127.0.0.1:3000` with the team's Open WebUI domain or LAN address.

## Migration Notes

- Do not copy local Open WebUI `user_id` values into this repository.
- Treat `integrations/openwebui/prompts/alanbim.prompt.json` as the portable template.
- Treat `integrations/openwebui/knowledge/alanclaw-bim-tools.knowledge.json` as the portable knowledge manifest.
- Treat `integrations/openwebui/models/alanclaw-construction-team.model.json` as the portable model profile.
- If Open WebUI changes its export schema, keep this file as the source prompt text and manually map fields during import.
- Keep `skills/alanclaw-bim-tools/SKILL.md` and this Open WebUI prompt aligned when changing BIM workflow rules.
