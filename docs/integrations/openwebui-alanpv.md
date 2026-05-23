# Open WebUI: AlanClaw Electrical PV Systems

This document records the Open WebUI setup for the AlanClaw electrical and photovoltaic systems team.

## Components

- Knowledge base: `AlanClaw Electrical PV Systems`
- Prompt: `AlanClaw Electrical PV Systems`
- Command: `/alanpv`
- Model profile: `AlanClaw Electrical PV Team`
- Skill: `skills/alanclaw-electrical-pv-systems`
- Prompt template: `integrations/openwebui/prompts/alanpv.prompt.json`
- Knowledge template: `integrations/openwebui/knowledge/alanclaw-electrical-pv-systems.knowledge.json`
- Model template: `integrations/openwebui/models/alanclaw-electrical-pv-team.model.json`

## Use Cases

Use `/alanpv` when the user provides:

- Electrical load lists, panel notes, single-line diagram notes, or floor-plan descriptions
- PV roof/site notes, target kW, inverter/module preferences, grid notes, or site survey observations
- Combined electrical + PV tie-in questions
- BOQ pre-check tasks for electrical or solar construction
- Site inspection, commissioning-prep, or team coordination requests

## Output Rules

The assistant should classify the request as electrical, PV, or combined electrical + PV, then produce:

1. Scope summary
2. Available inputs and missing inputs
3. Preliminary electrical design checklist
4. Preliminary PV design checklist, if relevant
5. BOQ pre-check table
6. Construction sequence and inspection checklist
7. Questions for designer, electrician, PV installer, utility, site team, or client
8. Confirmation message for the relevant team

## Safety Boundary

The output is preliminary planning only. The following must be marked `requires human confirmation`:

- Load calculations
- Cable sizes
- Breaker, fuse, RCD, RCBO, SPD, and isolator ratings
- Panel schedules and single-line diagrams
- Grounding, bonding, and lightning protection
- PV string sizing, inverter capacity, DC/AC ratio, and generation estimates
- Battery storage design and protection
- Grid connection and authority approval
- BOQ quantities, pricing, and procurement specs
- Construction safety and energization readiness

Do not stamp, approve, or finalize electrical design. Do not claim code compliance, grid approval, or energization readiness.

## Migration Steps

1. Open Open WebUI.
2. Go to `Workspace -> Knowledge`.
3. Create a knowledge base named `AlanClaw Electrical PV Systems`.
4. Add the sources listed in `integrations/openwebui/knowledge/alanclaw-electrical-pv-systems.knowledge.json`.
5. Go to `Workspace -> Prompts`.
6. Create a prompt named `AlanClaw Electrical PV Systems`.
7. Set command to `/alanpv`.
8. Paste the `content` value from `integrations/openwebui/prompts/alanpv.prompt.json`.
9. Enable the prompt.
10. Optionally create the model profile from `integrations/openwebui/models/alanclaw-electrical-pv-team.model.json`.
11. In chat, type `/alanpv`, then paste electrical/PV project notes, load lists, roof notes, BOQ items, or site observations.

## Team Setup URL

For a local Open WebUI install, the knowledge page is usually:

```text
http://127.0.0.1:3000/workspace/knowledge
```

For a team server, replace `127.0.0.1:3000` with the team's Open WebUI domain or LAN address.

## Migration Notes

- Do not copy local Open WebUI `user_id` values into this repository.
- Treat the files in `integrations/openwebui` as portable templates, not exact user-specific exports.
- If Open WebUI changes its export schema, keep the prompt/system text as the source of truth and manually map fields during import.
- Keep `skills/alanclaw-electrical-pv-systems/SKILL.md`, the Open WebUI prompt, and the model profile aligned when changing workflow rules.
