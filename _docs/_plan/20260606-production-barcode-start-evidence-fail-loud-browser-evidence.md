# Plan: ProductionBoard 扫码开工证据失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 真实 Chromium 能证明扫码开工证据归档失败时页面 fail loud。
- 失败后不能显示成功开工通知，不能显示扫码开工证据已写入，不能伪造 OTD 证据链。
- 不改变生产逻辑。
- 对未验证项 fail loud。

## 执行

- [x] 读取 coverage summary，确认 `StartQualificationPanel.vue` 是低覆盖且用户关键路径。
- [x] 检查现有 production e2e，避免重复已有开工通过、替班开工、无替班阻断用例。
- [x] 新增扫码开工 OTD 证据写入失败真实 Chromium 用例。
- [x] 运行定向 e2e 与相关 unit。
- [x] 更新报告、changelog、review、todo、plan。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "扫码开工证据写入失败"`：Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/production-board.test.ts`：22/22 passed。

## Stop Condition

- 本片 A 轨道证据已闭环。
- B 轨道外部发布闸门仍保持打开，不声明发布完成。
