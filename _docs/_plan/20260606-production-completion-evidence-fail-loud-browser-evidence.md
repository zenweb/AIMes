# 2026-06-06 ProductionBoard 完工证据失败 Plan

## Success Criteria

- 真实 Chromium 能模拟完工证据写入失败。
- 页面展示 `完工证据写入失败`，并暴露具体错误原因。
- 不展示 `完工报告已提交` 成功状态。
- 不写入不完整 OTD 证据链。
- 只补既有行为证据，不扩展生产功能。

## Result

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "完工证据写入失败"` 已通过。
- 生产代码未变更；本片是浏览器证据补齐。

## Stop Condition

- 本片到真实 Chromium 证据通过即停止，不继续扩大到其它生产域微切片。
