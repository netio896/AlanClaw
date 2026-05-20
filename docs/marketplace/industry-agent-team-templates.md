# AlanClaw 行业 Agent Team 模板

AlanClaw 的核心产品方向不是只创建单个专家，而是根据行业推荐一套可协作的 Agent Team。

v1 模板先定义三件事：

- 行业场景：用户选择的业务领域，例如建筑、电商、社交媒体营销。
- 推荐成员：从现有专家库中组合出基础团队。
- 角色分工：说明每个专家在团队里的职责和加入理由。

## v1 范围

当前版本只做模板推荐和一键加入，不做多 Agent 自动编排。

用户路径：

1. 进入 Web 专家广场。
2. 切换到“行业团队”。
3. 查看行业团队模板。
4. 打开团队详情，确认成员分工。
5. 点击“添加整套团队”，把成员加入我的专家。

## 初始模板

- 建筑行业 / Construction
- 电商行业 / Ecommerce
- 社交媒体营销 / Social Media Marketing

## 数据契约

模板源文件：

```text
data/team-templates/alanclaw-team-templates.json
```

生成文件：

```text
apps/web/team-data.js
apps/admin/team-data.js
```

本地服务接口：

```text
GET /api/team-templates
```

## 后续方向

- Admin 中编辑团队模板。
- 为每个团队增加默认工作流。
- 支持“行业 + 公司规模 + 渠道”组合推荐。
- 为团队成员定义协作顺序和交接输出。
