# Admin Agent 配置审批 fail-loud 自审

日期：2026-06-06

## 发现

- 修复前，Agent 治理关键配置审批失败会触发未处理异常，页面无 `role="alert"`。
- 修复后，审批写入失败不刷新、不乐观更新，并展示错误原因。
- 修复后，审批写入成功但后续刷新失败也会 fail-loud，避免管理员误以为页面状态已同步。

## 证据

- RED：新增单测先失败，失败点为未处理事件异常和缺少 alert。
- GREEN：`npm.cmd run test:unit -- tests/unit/admin-board.test.ts` -> 11 passed。
- 回归：`npm.cmd run test:unit:coverage` -> 84 files / 527 tests passed。
- 真实浏览器：`npm.cmd run test:e2e -- tests/e2e/admin.spec.ts` -> Chromium 30 passed。

## 风险

- 本地 Chromium 证据不等于 hosted CI。
- 此切片不证明 PostgreSQL/staging、Attack Chain 人工验证、安全签字或灰度观察。
- `AdminBoard` 仍有大量 Agent 治理分支，后续应继续按“用户可触发 + 发布治理关键 + 未覆盖失败路径”选片，而不是为了覆盖率随意补分支。
