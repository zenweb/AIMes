# Admin 质量灰度复核问题单关闭 fail-loud 自审

日期：2026-06-06

## 发现

- 修复前，Agent 治理补充负样本并关闭问题单失败会触发未处理事件异常，页面无 `role="alert"`。
- 修复后，问题单关闭写入失败不刷新、不乐观更新，并展示错误原因。
- 修复后，写入成功但灰度决策列表或 OTD 证据刷新失败也会 fail-loud。

## 证据

- RED：新增单测先失败，失败点为未处理事件异常和缺少 alert。
- GREEN：`npm.cmd run test:unit -- tests/unit/admin-board.test.ts` -> 14 passed。
- 回归：`npm.cmd run test:unit:coverage` -> 84 files / 530 tests passed。
- 真实浏览器：`npm.cmd run test:e2e -- tests/e2e/admin.spec.ts` -> Chromium 30 passed。

## 风险

- 本地 Chromium 证据不等于 hosted CI。
- 此切片不证明 PostgreSQL/staging、Attack Chain 人工验证、安全签字或灰度观察。
- 质量灰度复核仍剩一个用户按钮需要继续审查失败路径：调整范围重开校验。
