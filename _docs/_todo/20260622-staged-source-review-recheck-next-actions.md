# Todo - Staged source review recheck next actions - 2026-06-22

- Treat the staged package as intentionally rebuilt to 98 files after adding the minimal `http-refresh.test.ts`, router auth, Nuxt middleware recovery fixes, and documentation-only audit records.
- Prefer human review or explicit split of the staged package before adding more source hunks.
- If keeping the staged package together, rerun:
  - `git diff --cached --check`
  - `npm run test:unit -- tests/unit/http-refresh.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-auth-middleware.test.ts tests/unit/scheduling-api.test.ts tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts`
  - `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"`
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts --grep "急单 Agent 采纳后区分反馈与正式排产回写|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`
- Run E2E commands sequentially to avoid shared test-server port contention.
- Do not treat this review as full CC completion.
