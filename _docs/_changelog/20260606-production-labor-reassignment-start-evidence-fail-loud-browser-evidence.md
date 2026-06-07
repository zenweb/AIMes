# 2026-06-06 ProductionBoard 人员替班开工证据失败真实浏览器证据

## Changed

- 为 `ProductionBoard` 新增真实 Chromium 用例，覆盖人员替班开工时 OTD 开工证据归档失败的 fail-loud 路径。
- 用例确认后端开工已提交后，如果 `aimes_otd_evidence_chain` 写入失败，页面保留错误告警，不显示成功开工，也不伪造 `TRACE-LABOR-REASSIGN-WO-013-OP-10-START` 证据。
- 本片不改业务逻辑，只补 A 轨道关键路径证据。

## Tests

- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "人员替班开工证据写入失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/production-board.test.ts`：1 file passed，22/22 passed。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置，不能声明 e2e lint passed。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
