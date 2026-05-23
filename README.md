# AlanClaw

AlanClaw 是一个面向缅甸市场的 AI Agent 产品仓库。当前版本已经包含专家广场 Web 原型、本地专家管理台、18 位专家目录，以及本地可写的专家内容生成链路。

AlanClaw is a Myanmar-focused AI agent product repository with a local expert marketplace prototype, admin tool, and catalog generation workflow.

## Quick Start

```powershell
npm run dev
```

打开：

- Admin 管理台: [http://127.0.0.1:4176/](http://127.0.0.1:4176/)
- Web 专家广场: [http://127.0.0.1:4176/web/index.html](http://127.0.0.1:4176/web/index.html)

## Commands

```powershell
npm run dev
npm run generate
npm run smoke
```

- `npm run dev` 启动本地 admin 服务，并同时托管 Web 原型。
- `npm run generate` 从 `data/experts/alanclaw-experts.json` 重新生成 CSV、Markdown、Web 数据和 Admin 数据。
- `npm run smoke` 启动临时服务并检查关键页面、API 和保存链路。

## Usage Guide

- [Web and Admin 使用手册](docs/usage/admin-and-web-usage.md)
- [Open WebUI AlanClaw BIM Tools Prompt](docs/integrations/openwebui-alanbim.md)
- [AlanClaw v0.2 Release Notes](docs/releases/v0.2.md)

## Current Deliverables

- `apps/web/`: 移动端优先的专家广场原型。
- `apps/admin/`: 本地专家管理台，支持读取、编辑预览、校验和保存。
- `data/experts/alanclaw-experts.json`: 专家目录唯一源文件。
- `data/team-templates/alanclaw-team-templates.json`: 行业 Agent Team 模板源文件。
- `data/experts/alanclaw-experts.csv`: 后台导入用平面表。
- `content/experts/`: 18 位专家的 Markdown 详情文件。
- `schemas/expert-entry.schema.json`: 单个专家条目的 JSON schema。
- `scripts/generate_expert_catalog.mjs`: 专家目录生成器。
- `scripts/smoke_test.mjs`: 本地验收脚本。

## Product Direction

AlanClaw 的核心差异化从“单个专家”升级为“行业 Agent Team 模板”。用户可以选择建筑、电商、社交媒体营销等行业，直接获得一套基础专家团队，并按需一键加入工作区。

## Save Flow

Admin 管理台保存后会写回：

```text
data/experts/alanclaw-experts.json
```

然后重新生成：

```text
data/experts/alanclaw-experts.csv
apps/web/expert-data.js
apps/admin/expert-data.js
content/experts/*.md
```

## Scope

当前是本地开发产品包，不包含登录、权限、数据库或云部署。下一阶段可以继续做真实导入、版本历史、专家发布状态和部署流水线。
