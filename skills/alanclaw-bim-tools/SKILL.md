---
name: alanclaw-bim-tools
description: Use when working with AlanClaw construction/BIM workflows that involve IFC files, floor plan images, room/door/window detection, BIM hierarchy inspection, BOQ pre-checks, construction model summaries, or preparing outputs from Hugging Face Spaces network01/ifc-hierarchy-viewer and network01/Floor-Plan-Detection for the AlanClaw construction agent team.
---

# AlanClaw BIM Tools

Use this skill to route construction inputs to the right Hugging Face Space and turn the results into AlanClaw 建筑行业团队-ready prompts.

## Tool Choice

Use **IFC Hierarchy Viewer** when the input is a BIM/IFC model:

- Space: https://huggingface.co/spaces/network01/ifc-hierarchy-viewer
- Input: `.ifc`
- Output: spatial hierarchy, IFC class counts, element properties, raw table / CSV
- Best for: BIM model inspection, design handover, BOQ pre-check, property set review

Use **Floor Plan Detection** when the input is a drawing image:

- Space: https://huggingface.co/spaces/network01/Floor-Plan-Detection
- Input: floor plan image
- Output: room detection image, door/window detection image, JSON counts
- Best for: quick floor plan understanding, early room/door/window counting, site discussion

## Workflow

1. Identify the input type.
   - `.ifc` model: use IFC Hierarchy Viewer.
   - Screenshot/JPG/PNG/PDF floor plan image: use Floor Plan Detection.
2. Ask the user to upload the file to the matching Space if no output is already available.
3. Collect the Space output:
   - IFC Viewer: class table, hierarchy summary, element CSV, or copied rows.
   - Floor Plan Detection: JSON counts and annotated images.
4. Warn that AI/model outputs are pre-checks only. Do not treat counts, dimensions, quantities, materials, or pricing as final.
5. Convert the output into a prompt for AlanClaw 建筑行业团队.

## Construction Team Prompt Template

```text
使用 AlanClaw 建筑行业团队。

工具来源：
[IFC Hierarchy Viewer / Floor Plan Detection]

输入结果：
[粘贴 IFC class table / hierarchy / CSV / floor-plan detection JSON]

请帮我整理：
1. 初步空间/楼层/构件摘要
2. 房间、门窗或主要 IFC 类别的数量概览
3. 可能需要人工复核的位置和字段
4. BOQ 前置检查表
5. 发给设计/施工/现场团队的 Telegram 或微信确认消息

注意：
这只是 AI 或模型解析结果，不能作为最终工程数量。
所有数量、尺寸、材料、合同、报价和安全相关结论都标注“需人工确认”。
```

## Output Rules

- Never present detected quantities as final engineering quantities.
- Never generate final BOQ, pricing, safety approval, or legal/contract conclusions from these tools alone.
- Always mark uncertain geometry, quantities, material specs, dimensions, and model completeness as `需人工确认`.
- For client-facing summaries, explain that the result is a preliminary review based on uploaded model/image data.

## Extra Reference

Read `references/tool-map.md` when you need detailed use cases, example prompts, or a comparison table.
