# AlanClaw

AlanClaw 是一个面向缅甸市场的 AI Agent 产品仓库，当前阶段先交付专家广场内容底座，包括专家导入包、分类体系、产品说明和后续前后台消费契约。

AlanClaw is a Myanmar-focused AI agent product repository. This first version ships the expert marketplace content foundation, import assets, and repo contracts for future web and admin apps.

## 当前交付物

- `data/experts/alanclaw-experts.csv`：后台可直接导入的专家平面表
- `data/experts/alanclaw-experts.json`：结构化专家清单
- `content/experts/`：18 个专家的详情 Markdown 源文件
- `schemas/expert-entry.schema.json`：单个专家条目 schema
- `docs/`：产品定位、分类、导入规则、仓库布局说明

## 仓库目标

- 作为 AlanClaw 专家广场的内容源
- 为未来 `apps/web` 专家广场和 `apps/admin` 内容后台提供统一输入
- 为后续专家扩充、翻译、本地化和版本维护提供可审计结构

## 未来应用区域

- `apps/web`：公开专家广场、专家详情、搜索与筛选
- `apps/admin`：专家录入、编辑、审核、批量导入导出
- `packages/expert-catalog`：共享数据加载、校验、转换和发布契约

## v1 范围

当前不包含可执行前端或后台应用代码，只包含产品内容底座和未来集成约束。
