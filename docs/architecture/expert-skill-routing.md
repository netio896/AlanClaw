# AlanClaw Expert Skill Routing Draft

本文为 18 位 AlanClaw 专家建立候选 OpenClaw/QClaw skill 路由表。当前只是设计映射，不改专家数据结构、不创建 `skills/` 目录、不接入真实执行。

## 目标

把当前专家 marketplace 推进到“可执行 Agent marketplace”的准备阶段：

```text
expert.slug -> candidate skill_key -> intent -> execution status
```

这份映射用于下一阶段评估：

- 哪些专家可以优先接入本地文件/文档/表格类 skill
- 哪些专家需要外部账号或平台权限，必须暂缓
- 哪些专家本质上仍是提示词/协作型专家，短期保持 manual 更合适

## 状态定义

- `ready_candidate`: 适合优先做离线或本地原型。
- `planned`: 可以设计路由，但还需要输入契约或脚本封装。
- `manual`: 先保持人工/提示词执行，不接 OpenClaw skill。
- `blocked_external_account`: 涉及外部账号、消息发送或平台 API，暂缓真实执行。

## 候选 Skill 参考

来自本地只读观察 `C:\Users\Nelson-AI\.qclaw\skills`，可参考的候选目录包括：

- `xlsx`: 表格读取、整理、转换类任务。
- `pdf`: PDF 阅读、提取、摘要类任务。
- `docx`: Word 文档读取、生成、整理类任务。
- `kdocs`: 金山文档/WPS 云文档类任务。
- `email-skill`: 邮件草稿、收发或邮件工作流。
- `multi-search-engine`: 搜索、资料收集、市场信息检索。
- `dashboard-gen`: 数据看板生成。
- `prompt-engineer`: 提示词或文本任务包装。
- `doc-organizer`: 文档整理和归档。

这些只是候选，不表示 AlanClaw 已经能调用它们。

## 路由表

| Expert slug | 专家 | 候选 skill_key | Intent | 状态 | 理由 |
| --- | --- | --- | --- | --- | --- |
| `myanmar-sales-assistant` | 缅甸销售助理 | `prompt-engineer` | `sales_reply_draft` | `manual` | 主要是商务话术和判断，短期用提示词能力即可；真实 CRM/聊天发送需要另建执行边界。 |
| `telegram-support-expert` | Telegram 客服专家 | `telegram-support-placeholder` | `telegram_support_reply` | `blocked_external_account` | 涉及 Telegram 账号、客户消息和可能的发送动作，必须先有权限确认和日志。 |
| `facebook-page-reply-expert` | Facebook 页面回复专家 | `facebook-page-placeholder` | `facebook_comment_or_dm_reply` | `blocked_external_account` | 涉及 Facebook Page/Messenger 外部账号，不能直接自动执行。 |
| `burmese-english-chinese-translator` | 缅英中翻译专家 | `prompt-engineer` | `translate_and_localize` | `planned` | 适合先封装成纯文本任务；未来可叠加文档输入。 |
| `quotation-invoice-assistant` | 报价单与发票助理 | `docx` / `xlsx` | `quotation_invoice_draft` | `planned` | 可从结构化表格或文档生成报价/发票草稿；需要先定义金额、币种、税费字段契约。 |
| `document-summary-qa-expert` | 文档总结与问答专家 | `pdf` / `docx` / `kdocs` | `document_summary_qa` | `ready_candidate` | 文件/文档类低风险，适合先做本地读取和摘要原型。 |
| `project-followup-assistant` | 项目跟进助理 | `doc-organizer` / `notion` | `project_followup_plan` | `planned` | 可从会议记录或项目材料整理行动项；若写入 Notion 等外部系统则需确认。 |
| `excel-data-cleanup-expert` | Excel 数据整理专家 | `xlsx` | `clean_table` | `ready_candidate` | 表格类离线任务，最适合作为第一批执行路由原型。 |
| `ecommerce-support-automation-expert` | 电商客服自动化专家 | `prompt-engineer` | `faq_flow_design` | `manual` | 当前更像流程设计和模板输出；真实客服自动化涉及平台和发送动作，暂不执行。 |
| `myanmar-market-intel-expert` | 缅甸市场情报专家 | `multi-search-engine` | `market_research_brief` | `planned` | 可做搜索和情报摘要，但信息时效高，需要来源、日期和引用策略。 |
| `social-copywriting-expert` | 社交媒体文案专家 | `prompt-engineer` | `social_copy_draft` | `manual` | 纯内容生成可先保持提示词执行；发布到平台必须暂缓。 |
| `facebook-ads-assistant` | Facebook 广告投放助理 | `facebook-ads-placeholder` | `ad_plan_draft` | `blocked_external_account` | 涉及广告账号、预算和投放设置，必须只做计划草稿，不能自动投放。 |
| `quotation-followup-assistant` | 报价跟单助理 | `email-skill` | `quotation_followup_email` | `planned` | 可先生成跟进邮件草稿；真实发送需用户确认。 |
| `customer-followup-expert` | 客户回访专家 | `email-skill` | `customer_followup_draft` | `planned` | 可先生成回访邮件/消息草稿；批量发送和客户数据需权限边界。 |
| `meeting-minutes-assistant` | 会议纪要助理 | `docx` / `doc-organizer` | `meeting_minutes_to_actions` | `ready_candidate` | 可本地处理会议文本，输出纪要和行动项，风险低。 |
| `document-organizer-master` | 资料整理大师 | `doc-organizer` | `organize_documents` | `ready_candidate` | 文档整理和分类适合本地文件夹原型，但不能自动删除或移动用户文件。 |
| `multilingual-support-expert` | 多语言客服专家 | `prompt-engineer` | `multilingual_support_reply` | `manual` | 多语言回复可以先走提示词；真实客服渠道发送需外部账号边界。 |
| `content-topic-planner` | 内容选题策划师 | `multi-search-engine` / `prompt-engineer` | `content_topic_plan` | `ready_candidate` | 可结合搜索和提示词生成选题，先做只读研究和内容计划。 |

## 第一批推荐原型

第一批只做本地、低风险、可验收的专家：

1. `excel-data-cleanup-expert` -> `xlsx` -> `clean_table`
2. `document-summary-qa-expert` -> `pdf` / `docx` -> `document_summary_qa`
3. `meeting-minutes-assistant` -> `docx` / `doc-organizer` -> `meeting_minutes_to_actions`
4. `document-organizer-master` -> `doc-organizer` -> `organize_documents`
5. `content-topic-planner` -> `multi-search-engine` / `prompt-engineer` -> `content_topic_plan`

这 5 个专家不需要外部账号，不涉及自动发消息或广告投放，适合作为 `alanclaw_expert_router` 的初始范围。

## 暂缓真实执行的专家

这些专家可以继续在 Web/Admin 中展示和编辑，但不建议接入自动执行：

- `telegram-support-expert`
- `facebook-page-reply-expert`
- `facebook-ads-assistant`
- `ecommerce-support-automation-expert`
- `multilingual-support-expert`

原因：

- 可能读取客户私信或订单信息。
- 可能发送消息、回复评论或触发广告投放。
- 需要账号授权、操作确认、审计日志和撤销策略。

## 后续数据文件建议

Phase 2 可以新增独立映射文件：

```text
data/execution/expert-skill-map.json
```

建议结构：

```json
{
  "excel-data-cleanup-expert": {
    "skill_key": "xlsx",
    "intent": "clean_table",
    "status": "ready_candidate",
    "requires_files": true,
    "requires_external_account": false
  }
}
```

同时新增校验：

- 每个 key 必须存在于 `data/experts/alanclaw-experts.json`
- 每位专家必须有映射或显式 `status: "manual"`
- `skill_key` 不为空，除非 `status` 是 `manual`
- `blocked_external_account` 必须标记 `requires_external_account: true`

## Router 原型输入输出草案

未来 `skills/alanclaw_expert_router/scripts/route-expert-task.mjs` 可接受：

```json
{
  "expert_slug": "excel-data-cleanup-expert",
  "task": "清洗这份客户表，统一手机号格式并找出重复客户",
  "files": ["customers.xlsx"]
}
```

返回：

```json
{
  "ok": true,
  "expert_slug": "excel-data-cleanup-expert",
  "skill_key": "xlsx",
  "intent": "clean_table",
  "requires_files": true,
  "requires_external_account": false,
  "execution_mode": "plan_only",
  "next_step": "准备调用 xlsx skill 的 clean_table 流程"
}
```

第一版 router 应保持 `execution_mode: "plan_only"`，只返回路由计划，不执行外部服务。

## 验收边界

本阶段完成标准：

- 18 位专家都有候选执行状态。
- 第一批原型专家明确。
- 外部账号类专家明确暂缓。
- 不修改现有 Web/Admin 功能。
- `npm run smoke` 继续通过。
