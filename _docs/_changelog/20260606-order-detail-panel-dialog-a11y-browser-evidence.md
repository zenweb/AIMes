# 2026-06-06 OrderDetailPanel 工单详情抽屉语义真实浏览器证据

## Changed

- 为 `OrderDetailPanel` 补充工单详情抽屉的 dialog/status/alert 可访问语义。
- 关闭按钮现在具备明确可访问名称 `关闭工单详情`。
- 在 scheduling 真实 Chromium 的工单详情接口失败兜底场景中验证抽屉、错误提示和关闭按钮语义。

## Tests

- `npm.cmd run test:unit:coverage`：86 files passed，560 tests passed，总行覆盖率 `78.97%`。
- `npm.cmd run test:unit -- tests/unit/order-detail-panel.test.ts`：1 file passed，2/2 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "工单详情接口失败"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片不改变工单详情加载或排产解释兜底逻辑。
- B 轨道发布闸门仍未关闭。
