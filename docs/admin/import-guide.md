# AlanClaw 专家导入说明

## 导入资产

- `data/experts/alanclaw-experts.csv`
- `data/experts/alanclaw-experts.json`
- `content/experts/*.md`

## 必填字段

- `slug`
- `title`
- `category`
- `card_summary`
- `about_text`
- `system_prompt`
- `tags`
- `languages_supported`
- `channels_supported`
- `featured`
- `sort_order`

## 字段规则

### slug

- 使用小写 kebab-case
- 一经发布不要修改
- CSV、JSON、Markdown 文件名必须一致

### tags

- CSV 中使用 `|` 分隔
- JSON 中使用字符串数组
- Markdown frontmatter 中使用数组

### languages_supported / channels_supported

- CSV 中使用 `|` 分隔
- JSON 中使用字符串数组
- Markdown frontmatter 中使用数组

### featured

- JSON 中为布尔值
- CSV 与 Markdown 中使用 `true` 或 `false`

### sort_order

- 必须为唯一整数
- 数字越小越靠前

## 更新单个专家的安全步骤

1. 先修改 `content/experts/<slug>.md`
2. 再同步修改 `alanclaw-experts.json`
3. 最后同步修改 `alanclaw-experts.csv`
4. 运行一致性校验，确认三个来源一致

## 导入前检查

- 总专家数是否为 18
- slug 是否唯一
- sort_order 是否唯一
- featured 值在三份资产中是否一致
- system_prompt 是否仍为中文优先、任务型、可执行内容
