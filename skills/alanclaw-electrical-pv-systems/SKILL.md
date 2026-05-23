---
name: alanclaw-electrical-pv-systems
description: Use when working with AlanClaw electrical and photovoltaic workflows, including low-voltage distribution, lighting and socket layouts, load estimates, single-line diagrams, grounding, lightning protection, PV modules, inverters, combiner boxes, cable routes, grid connection, battery-ready design, BOQ pre-checks, and construction inspection.
---

# AlanClaw Electrical + PV Systems

Use this skill to prepare preliminary electrical and photovoltaic design or construction workflows for the AlanClaw construction agent team.

## Scope

This workflow covers preliminary review and planning for:

- Low-voltage distribution systems
- Lighting, socket, and small power layouts
- Load schedule collection and preliminary demand review
- Main distribution board and sub-panel planning
- Cable route and containment planning
- Grounding and bonding review
- Lightning and surge protection review
- PV module layout and string planning
- Inverter, combiner box, isolator, and protection review
- AC/DC cable route planning
- Grid connection and meter room coordination
- Battery or hybrid inverter readiness
- Electrical and PV BOQ pre-checks
- Construction sequence and site inspection checklists

## Required Inputs

Ask for the available project information before producing quantities or specifications:

- Building type and location
- Floor plan, roof plan, or site plan
- Electrical load list or appliance list
- Utility/grid requirements, if available
- Target PV system size, if known
- Roof type, available area, shading notes, and orientation
- Existing panel capacity and incoming supply details
- Local code or authority requirements
- Photos of site, roof, panel room, and cable routes

## Output Workflow

1. Identify whether the request is electrical, PV, or combined electrical + PV.
2. Summarize the available inputs and missing inputs.
3. Produce a preliminary design checklist.
4. Produce a construction and inspection checklist.
5. Produce a BOQ pre-check table.
6. Mark all engineering-critical values as `requires human confirmation`.
7. Provide a message for the design team, site team, client, or utility coordinator.

## Electrical Design Checklist

- Confirm incoming supply and panel capacity.
- Confirm load schedule and diversity assumptions.
- Check lighting, socket, HVAC, pump, equipment, and special loads.
- Identify panel locations and cable route constraints.
- Confirm protection devices, RCD/RCBO requirements, and isolation needs.
- Confirm grounding, bonding, and surge protection requirements.
- Confirm fire stopping, cable tray/conduit, and access requirements.

## PV Design Checklist

- Confirm roof/site usable area and shading conditions.
- Confirm target system size and grid export rules.
- Confirm module layout, row spacing, and maintenance access.
- Confirm inverter type, MPPT/string limits, and DC/AC ratio.
- Confirm DC isolator, combiner box, SPD, earthing, and labeling.
- Confirm AC tie-in point, meter, protection, and utility approval.
- Confirm battery/hybrid readiness if requested.

## Construction Safety Boundary

Never present preliminary AI output as final electrical design.

Always mark these as `requires human confirmation`:

- Load calculations
- Cable sizes
- Breaker, fuse, RCD, RCBO, SPD, and isolator ratings
- Panel schedules and single-line diagrams
- Grounding, bonding, and lightning protection conclusions
- PV string sizing, inverter capacity, DC/AC ratio, and generation estimates
- Battery storage design and protection
- Grid connection and authority approval
- BOQ quantities, pricing, and procurement specs
- Construction safety and energization readiness

## Prompt Template

```text
Use AlanClaw Electrical + PV Systems.

Project input:
[paste project description, floor plan notes, load list, roof/site notes, PV target, or site photos summary]

Please produce:
1. Electrical/PV scope summary
2. Missing information checklist
3. Preliminary electrical design checklist
4. Preliminary PV design checklist
5. BOQ pre-check table
6. Construction sequence and inspection checklist
7. Design/site/client confirmation message

Safety rule:
All load, cable, protection, grounding, PV capacity, generation, BOQ, price, and construction safety conclusions must be marked "requires human confirmation".
```

## Output Rules

- Do not stamp or approve design.
- Do not produce final cable sizing or protection ratings without design inputs and licensed engineer confirmation.
- Do not claim grid approval, safety compliance, or energization readiness.
- Use tables for BOQ pre-checks and inspection steps.
- Keep client-facing language clear: this is preliminary planning, not final engineering approval.
