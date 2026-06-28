# Next Actions: scheduling Agent E2E offline entry regression

- Done: 单独处理 Agent 工作台后端 API E2E，未把结论混入 `schedule-labor-evidence-retry` 绿色声明。
- Done: 将 Agent 后端 API 用例纳入 live backend mock 路由，避免 offline demo skip 阻断 `/recommend` 与 `/adopt`。
- Done: 补齐 scheduling 首屏 API mock，避免无关 401 触发 `/auth/refresh` 与登录跳转。
- Done: 复跑 Agent 聚焦子集，当前 5/5 passed。
- Next: 不声明全量 `tests/e2e/scheduling.spec.ts` 绿色；如要继续扩大范围，先切分当前 `scheduling.spec.ts` 中既有大量 unstaged 变更，避免污染 staged 人员证据候选片。
