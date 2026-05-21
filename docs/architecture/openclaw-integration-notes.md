# AlanClaw OpenClaw Integration Notes

本文记录 AlanClaw 未来对接 OpenClaw/QClaw skills 的设计边界。当前仓库还没有 OpenClaw 执行层，本文件用于先固定集成方向，避免过早把 marketplace、Admin 数据和技能运行时混在一起。

## 当前事实

AlanClaw 现在已经具备：

- Web 专家广场
- Admin 专家管理台
- 18 位专家目录
- 3 套行业 Agent Team 模板
- 专家和团队模板的本地校验、保存与数据生成
- `data/execution/expert-skill-map.json` 专家到候选 skill 的独立映射
- `skills/alanclaw_expert_router/` plan-only 独立 skill 入口
- `npm run smoke` 本地验收

AlanClaw 现在还没有：

- OpenClaw Gateway 配置
- 技能安装或启用流程
- 真实外部服务执行调用链
- 专家到真实 skill adapter 的执行实现

当前 OpenClaw 关系已经推进到 plan-only 阶段：AlanClaw 上层提供专家广场和行业团队体验，底层已有独立 router skill 读取本地专家和映射数据，但仍不做真实执行。

## 本地 QClaw Skills 观察

只读检查 `C:\Users\Nelson-AI\.qclaw\skills` 后，可参考的共性约定是：

- 每个 skill 通常以独立目录存在。
- `SKILL.md` 是主要入口说明。
- 一些 OpenClaw skill 使用 frontmatter `metadata.openclaw`。
- `metadata.openclaw.skillKey` 与技能目录名需要保持一致，便于 OpenClaw 配置或 allowlist 引用。
- 技能根目录可能包含 `scripts/`、`references/`、`assets/`、`package.json` 或语言依赖文件。
- 技能执行通常要求在技能根目录运行脚本。
- 技能可以被放在工作区 `./skills/<skill_key>/`，也可以放在用户级 skills 目录。

这些是现有本地资料中的实践观察，不等同于 AlanClaw 已经实现的运行能力。

## 集成原则

### 1. Marketplace 与执行层分离

AlanClaw 的 Web/Admin 继续负责：

- 展示专家
- 管理专家内容
- 管理行业团队模板
- 维护业务场景、语言、渠道、摘要和提示词

OpenClaw/QClaw skills 负责：

- 真正执行任务
- 读取文件或外部输入
- 调用脚本、浏览器、搜索、数据库或第三方服务
- 返回任务结果

专家目录不应该直接塞入大量执行脚本。专家目录应保存“这个专家能做什么”和“应该路由到哪个 skill”。

### 2. 先加映射，不急着执行

下一阶段最小改动不应该直接接入 OpenClaw Gateway，而是先增加设计和映射：

```text
expert.slug -> skill_key -> skill intent/action
```

例如：

```text
excel-data-cleanup-expert -> dashboard-gen or xlsx -> clean_table
document-summary-qa-expert -> kdocs or docx/pdf -> summarize_or_qa
telegram-support-expert -> telegram skill placeholder -> support_reply
```

只有映射稳定后，再考虑真实调用。

### 3. 团队模板只组合专家，不直接组合技能

行业 Agent Team 模板当前组合的是专家成员：

```text
team -> recommended_experts[].slug
```

这个关系应该保留。团队模板不应直接绑定 skill。原因是：

- Web 用户理解的是专家和行业团队。
- Admin 维护的是业务组合。
- 技能选择属于执行层细节。

真实执行时可以通过专家再解析到 skill。

### 4. Admin 先做可见配置，再做执行测试

如果未来要在 Admin 增加 OpenClaw 相关字段，优先增加只读或配置型字段，例如：

- `skill_key`
- `skill_intent`
- `execution_status`
- `requires_files`
- `requires_external_account`

不要一开始就在 Admin 中做真实执行按钮。执行按钮需要处理权限、沙箱、错误、日志和用户数据边界，风险更高。

## 推荐目录方案

如果 AlanClaw 后续要加入工作区级 skills，可采用：

```text
skills/
  alanclaw_expert_router/
    SKILL.md
    package.json
    scripts/
      route-expert-task.mjs
    references/
      expert-skill-map.md
```

也可以先不创建真实 skill 目录，只创建映射文档：

```text
docs/architecture/expert-skill-routing.md
```

推荐顺序是先写映射文档，再创建 `skills/` 目录。

## 数据映射草案

未来可以在专家数据中追加可选执行字段，但当前不建议马上改 schema。

候选字段：

```json
{
  "execution": {
    "skill_key": "xlsx",
    "intent": "clean_table",
    "requires_files": true,
    "status": "planned"
  }
}
```

短期更稳的做法是单独维护映射文件：

```text
data/execution/expert-skill-map.json
```

示例：

```json
{
  "excel-data-cleanup-expert": {
    "skill_key": "xlsx",
    "intent": "clean_table",
    "status": "planned"
  },
  "document-summary-qa-expert": {
    "skill_key": "pdf",
    "intent": "summarize_or_qa",
    "status": "planned"
  }
}
```

这样不会打断当前专家目录、Admin 编辑器和 smoke baseline。

## 分阶段路线

### Phase 1: 只读映射

目标：

- 新增 `docs/architecture/expert-skill-routing.md`
- 列出 18 位专家的候选 skill_key 和 intent
- 不改数据结构
- 不改 Web/Admin 功能

验收：

- 文档能解释每位专家未来由哪个 skill 执行
- `npm run smoke` 继续通过

### Phase 2: 独立映射数据

目标：

- 新增 `data/execution/expert-skill-map.json`
- 新增 schema 校验
- smoke 增加映射完整性检查

验收：

- 18 位专家都有映射或明确 `status: "manual"`
- 不存在未知专家 slug
- 不存在空 skill_key

当前状态：已新增独立映射数据和 `alanclaw_expert_router` plan-only skill，smoke 已覆盖映射完整性和 Excel 专家路由计划。

### Phase 3: Admin 只读展示

目标：

- Admin 专家详情显示执行映射
- 不提供执行按钮
- Web 不暴露技术字段

验收：

- 维护者知道某专家未来会路由到哪个 skill
- 普通用户体验不受影响

### Phase 4: Skill Router 原型

目标：

- 新增 `skills/alanclaw_expert_router/SKILL.md`
- 提供脚本读取 expert slug 和任务输入
- 只返回路由计划，不真实执行外部服务

验收：

- 能从专家 slug 得到 skill_key、intent 和所需输入
- 失败时返回明确错误

### Phase 5: 真实执行接入

目标：

- 对少数低风险专家接入真实 skill
- 优先选择文件/文档/表格类离线任务
- 暂缓外部账号类任务，例如 Telegram、Facebook、Email

验收：

- 有执行日志
- 有错误状态
- 有用户确认边界
- 不把敏感数据自动发送到第三方

## 优先接入候选

建议优先选择低风险、可本地验证的专家：

1. `excel-data-cleanup-expert`
2. `document-summary-qa-expert`
3. `document-organizer-master`
4. `meeting-minutes-assistant`
5. `content-topic-planner`

暂缓接入：

- `facebook-ads-assistant`
- `facebook-page-reply-expert`
- `telegram-support-expert`
- `ecommerce-support-automation-expert`

这些涉及外部账号、消息发送或平台接口，需要权限和确认机制。

## 不建议现在做

当前不建议直接做：

- 把所有专家转换成 OpenClaw skills
- 在 Web 中直接暴露 skill_key
- 在 Admin 中增加“立即执行”按钮
- 自动读取用户文件并发送给外部服务
- 为每个行业团队创建独立 skill
- 在没有映射校验前修改专家 schema

## 下一步建议

已新增 `docs/architecture/expert-skill-routing.md`，为 18 位专家建立候选 skill 映射表。

下一步可进入 Phase 3：在 Admin 专家详情中只读展示执行映射，不提供执行按钮，不向 Web 暴露技术字段。
