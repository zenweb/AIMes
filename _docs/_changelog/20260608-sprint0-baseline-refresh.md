# 2026-06-08 Sprint 0 Baseline Refresh

## 变更

- 按 CC plan Sprint 0 / 0.0 重新跑当前工作树测试基线，不沿用 2026-06-05 旧结论。
- 后端基线命令：
  - `dotnet restore src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --force --no-cache`
  - `dotnet restore src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --force --no-cache`
  - `dotnet test .\src\backend\AIMes.slnx --no-restore -m:1`
- 前端基线命令：
  - `npm run lint`
  - `npm run build`
  - `npm run test:unit`
  - `npx vitest run --pool forks --maxWorkers 1`
  - `npm run test:e2e -- --reporter=list`

## 结果

- 后端：PASS
  - Architecture `85 passed`
  - Evaluation `2 passed`
  - Integration `175 passed`
  - Unit `434 passed`
- 前端 lint：PASS
- 前端 build：PASS
- 前端 unit（默认命令 `npm run test:unit`）：FAIL
  - `335 passed`
  - `15 unhandled errors`
  - 现象：Vitest fork worker startup timeout，不足以作为可信绿灯
- 前端 unit（串行基线复核 `npx vitest run --pool forks --maxWorkers 1`）：PASS
  - `89 files / 596 tests passed`
- 前端 e2e：FAIL
  - `345 passed / 13 failed`
  - 失败集中在 `admin.spec.ts`、`audit.spec.ts`、`chat.spec.ts`、`report.spec.ts`

## 结论

- 当前 0.0 基线不是“全绿”。
- 可信基线结论是：
  - 后端测试面当前为绿
  - 前端 lint/build 为绿
  - 前端 unit 默认并行模式不稳定，存在 worker timeout 噪音
  - 前端 e2e 存在 13 个真实失败，集中在 Agent 治理 / 审计回放 / ChatPanel / 报表跨模块证据链
