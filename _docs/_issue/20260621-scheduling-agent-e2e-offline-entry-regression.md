# Issue: scheduling Agent E2E offline entry regression

## 现象

全量 `tests/e2e/scheduling.spec.ts` 当前不能作为绿色证据使用：

- 直接全量运行 10 分钟超时。
- 最新聚焦 Agent 子集里 6 条用例有 4 条通过，2 条失败：
  - `调度员 Agent 工作台通过后端 API 生成并采纳推荐`
  - `调度员 Agent 工作台后端 403 时保留 fallback 并提示权限`

## 已确认

- 失败最初表现为 `.agent-workbench-panel` 等待超时，页面被路由守卫带到登录页。
- 根因之一是普通旧 scheduling E2E 入口缺少显式 `?offlineDemo=1`；路由守卫会清理 demo token 并跳转登录。
- 已将普通旧用例入口改为 `scheduling?offlineDemo=1`，live backend mock 用例保持 `scheduling?offlineDemo=0`。
- 该修正后，以下 3 条已通过：
  - `展示基线与 Agent 的 OTD 改善`
  - `展示调度员 Agent 工作台`
  - `调度员 Agent 工作台提供后端建议采纳拒绝入口`

## 解决结果

- 已修复 Agent 后端 API 用例被 offline demo 入口拦截的问题。
- `src/frontend/scripts/e2e.mjs` 已将 Agent 后端 API 用例识别为 live backend mock 目标，使该子集构建时使用 `VITE_OFFLINE_DEMO=false`。
- `src/frontend/tests/e2e/scheduling.spec.ts` 已把 Agent 后端 API 用例纳入 live mock 入口，并在进入页面前 mock scheduling 首屏依赖，避免无关 `/api/v1/**` 401 触发登录跳转。
- Agent 专用 `/api/v1/scheduling/agent/recommend` 与 `/adopt` 仍由 `mockAgentApi` 控制，保留成功、403 与 API 不可用三类行为覆盖。

## 当前证据

- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "调度员 Agent 工作台通过后端 API"`：1/1 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`：2/2 passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "展示调度员 Agent 工作台|调度员 Agent 工作台提供后端建议|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`：5/5 passed。

## 当前影响

- 不影响 `schedule-labor-evidence-retry` 核心证据：
  - 人员证据 E2E 子集 3/3 通过。
  - 人员证据相关单测 92/92 通过。
- Agent 工作台后端 API 聚焦红点已解除。
- 仍不能把这个结果扩大声明为全量 `tests/e2e/scheduling.spec.ts` 绿色；全量 scheduling E2E 需要另行审计。
