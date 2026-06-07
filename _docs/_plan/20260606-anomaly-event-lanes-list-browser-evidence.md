# 2026-06-06 AnomalyBoard 现场事件分流队列语义 Plan

## 成功标准

- 现场事件中心分流队列在组件单测中暴露 `role="list"`。
- 分流队列 `aria-label` 包含 lane 数量。
- 每条 lane 暴露 `role="listitem"`，并包含事件类型、标题和下游路线的可访问名称。
- 真实 Chromium “展示异常到风险、排产、质量、采购的处置闭环”场景验证 list/listitem 语义，并保持风险队列导航可用。
- 不改动异常分流业务逻辑。

## 执行

1. 读取 `AnomalyBoard.vue`、组件单测和 `anomaly.spec.ts` 的现场事件中心路径。
2. 新增 RED 单测证明原分流队列缺少 list/listitem 语义。
3. 最小修改组件语义属性和可访问名称 helper。
4. 升级目标 e2e 断言到真实浏览器语义验证。
5. 运行目标单测、目标 Chromium e2e、lint，并记录文档。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- lint 已通过。
- B 轨道发布闸门未纳入本片完成标准。
