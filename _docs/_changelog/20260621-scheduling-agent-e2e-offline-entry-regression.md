# Scheduling Agent E2E offline entry regression

- Fixed focused Agent Workbench E2E coverage so backend API scenarios run in live-backend-mock mode instead of being trapped by offline demo mode.
- `src/frontend/scripts/e2e.mjs` now treats Agent backend API test titles as live backend mock targets and builds them with `VITE_OFFLINE_DEMO=false`.
- `src/frontend/tests/e2e/scheduling.spec.ts` now routes Agent backend API cases through `mockSchedulingPlanApis(page)` before page entry, while keeping Agent `/recommend` and `/adopt` behavior under `mockAgentApi`.
- Added broad first-screen `/api/v1/**` mock coverage for these focused cases to prevent unrelated 401 responses from causing login/dashboard loops.

## Evidence

- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "调度员 Agent 工作台通过后端 API"`: 1/1 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`: 2/2 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "展示调度员 Agent 工作台|调度员 Agent 工作台提供后端建议|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`: 5/5 passed.

## Boundary

- This is Agent Workbench focused evidence only.
- Do not claim full `tests/e2e/scheduling.spec.ts` pass from this result.
