# Open WebUI: AlanClaw BIM Tools Prompt

This document records the Open WebUI prompt used to connect AlanClaw BIM workflows with the `AlanClaw BIM Tools` knowledge base.

## Prompt

- Name: `AlanClaw BIM Tools`
- Command: `/alanbim`
- Status: enabled
- Knowledge base: `#AlanClaw BIM Tools`
- Template file: `integrations/openwebui/prompts/alanbim.prompt.json`
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
2. Go to `Workspace -> Prompts`.
3. Create or edit a prompt named `AlanClaw BIM Tools`.
4. Set command to `/alanbim`.
5. Paste the `content` value from `integrations/openwebui/prompts/alanbim.prompt.json`.
6. Enable the prompt.
7. Attach or recreate the knowledge base named `AlanClaw BIM Tools`.
8. In chat, type `/alanbim`, then paste IFC Viewer output, Floor Plan Detection output, a webpage link, or a project brief.

## Migration Notes

- Do not copy local Open WebUI `user_id` values into this repository.
- Treat `integrations/openwebui/prompts/alanbim.prompt.json` as the portable template.
- If Open WebUI changes its export schema, keep this file as the source prompt text and manually map fields during import.
- Keep `skills/alanclaw-bim-tools/SKILL.md` and this Open WebUI prompt aligned when changing BIM workflow rules.
