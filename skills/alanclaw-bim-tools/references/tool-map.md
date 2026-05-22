# AlanClaw BIM Tool Map

## IFC Hierarchy Viewer

Link: https://huggingface.co/spaces/network01/ifc-hierarchy-viewer

Purpose:

- Explore IFC / BIM model hierarchy.
- Inspect Project > Site > Building > Storey > Elements.
- Count IFC classes such as `IfcWall`, `IfcDoor`, `IfcWindow`, `IfcSlab`, `IfcSpace`.
- Inspect element attributes and property sets.
- Export raw element tables for downstream review.

Use cases:

- BIM model quick audit.
- Design / construction handover review.
- BOQ pre-check from model data.
- Model completeness review.
- Preparing design-team questions.

Recommended prompt after using it:

```text
使用 AlanClaw 建筑行业团队。

这是 IFC Hierarchy Viewer 导出的模型摘要/CSV：
[粘贴内容]

请输出：
1. 模型包含的主要 IFC 类别
2. 楼层和构件结构摘要
3. 缺失或需要人工确认的属性字段
4. BOQ 前置检查表
5. 发给设计团队的确认消息

所有工程数量、尺寸、材料和报价都标注“需人工确认”。
```

## Floor Plan Detection

Link: https://huggingface.co/spaces/network01/Floor-Plan-Detection

Purpose:

- Detect rooms, doors, and windows from floor plan images.
- Produce annotated images and JSON counts.
- Help users understand plans before detailed takeoff.

Use cases:

- Early floor-plan review.
- Room / door / window pre-count.
- Renovation discussion.
- Site communication.
- Client education before quoting.

Recommended prompt after using it:

```text
使用 AlanClaw 建筑行业团队。

这是 Floor Plan Detection 的识别结果：
[粘贴 JSON 或检测摘要]

请输出：
1. 初步房间/门窗数量
2. 可能需要人工复核的位置
3. BOQ 前置检查表
4. 发给现场团队的 Telegram/微信确认消息

这只是 AI 识别结果，不能作为最终工程数量。
所有数量、尺寸、材料和报价都标注“需人工确认”。
```

## Comparison

| Tool | Input | Output | Best For |
|---|---|---|---|
| IFC Hierarchy Viewer | `.ifc` BIM model | hierarchy, class counts, properties, CSV | BIM/model review |
| Floor Plan Detection | image floor plan | annotated images, JSON counts | quick visual detection |

