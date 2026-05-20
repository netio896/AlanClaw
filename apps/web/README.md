# apps/web

AlanClaw 第一版移动端优先专家广场原型。

## 当前内容

- `index.html`：单页原型入口
- `styles.css`：移动端优先样式
- `app.js`：搜索、筛选、详情浮层、我的专家本地状态
- `expert-data.js`：前端直接消费的专家数据副本

## 原型范围

- 底部 4 标签：专家、我的专家、文件、我的
- 顶部 `推荐 / 热门 / 最新`
- 分类筛选
- 搜索
- 专家详情全屏浮层
- `添加专家 / 已添加` 轻交互

## 本地使用

直接在浏览器打开 [index.html](./index.html) 即可预览。

如果专家数据有更新，先运行：

```powershell
node .\scripts\generate_expert_catalog.mjs
```
