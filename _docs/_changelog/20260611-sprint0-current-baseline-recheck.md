# 2026-06-11 Sprint 0 当前工作树基线复核

## 背景

按 CC plan 任务 0.0，后续所有“通过”必须建立在可信基线之上。2026-06-08 的基线记录仍保留历史红点；本片对当前工作树重新复核，不用旧结论替代当前证据。

## 执行

- 后端解决方案测试：`dotnet test .\src\backend\AIMes.slnx --no-restore -m:1`
- 前端 lint：`npm run lint`
- 前端 production build：`npm run build`
- 前端 unit 串行基线：`npx vitest run --pool forks --maxWorkers 1`
- 旧红区复核：
  - `npm run test:e2e -- admin.spec.ts audit.spec.ts --reporter=list`
  - `AIMES_E2E_PORT=4175 npm run test:e2e -- chat.spec.ts report.spec.ts --reporter=list`
- 全量真实浏览器 e2e：`AIMES_E2E_PORT=4177 npm run test:e2e -- --reporter=list`

## 结果

- 后端：PASS
  - Architecture：113 passed
  - Evaluation：2 passed
  - Integration：195 passed
  - Unit：438 passed
- 前端 lint：PASS
- 前端 build：PASS
- 前端 unit 串行：90 files / 601 tests passed
- 旧红区：
  - admin/audit：67 passed
  - chat/report：52 passed
- 前端全量 Chromium e2e：361 passed

## 备注

- 第一次并行跑 `chat.spec.ts report.spec.ts` 时遇到 `127.0.0.1:4173` 端口占用；复核显示端口处于 `TimeWait`，改用 `AIMES_E2E_PORT=4175` 后通过，判定为环境冲突而非业务红灯。

