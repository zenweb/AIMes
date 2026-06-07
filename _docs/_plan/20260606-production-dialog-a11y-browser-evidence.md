# 2026-06-06 ProductionBoard 操作弹窗语义 Plan

## 成功标准

- 异常上报弹窗在组件单测中暴露为 `role="dialog"`。
- 异常上报弹窗具备 `aria-modal="true"`，并通过 `aria-labelledby` 指向“异常上报”标题。
- 取消异常上报按钮具备场景化可访问名称。
- 真实 Chromium 异常上报场景通过 `getByRole('dialog', { name: '异常上报' })` 验证，并继续完成风险联动链路。
- 不改动生产业务逻辑、API 调用或证据写入逻辑。

## 执行

1. 读取 `ProductionBoard.vue`、`production-board.test.ts` 和 `production.spec.ts` 的既有生产弹窗路径。
2. 新增 RED 单测证明异常上报弹窗缺少 modal dialog 语义。
3. 最小修改三个同结构弹窗语义属性和取消按钮可访问名称。
4. 升级异常上报 e2e 断言到 `role=dialog`。
5. 运行目标单测、目标 Chromium e2e、lint，并记录文档。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- lint 已通过。
- B 轨道发布闸门未纳入本片完成标准。
