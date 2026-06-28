# Plan - Schedule Labor Evidence Retry

## Success Criteria

- 人员约束启动证据加载失败时，调度员能看到明确原因。
- 同一页面提供可点击恢复动作，不要求刷新整个应用。
- 重试成功后清除旧人员证据警告，并恢复人员替班/放行事件。
- 不削弱 offline demo 安静降级和真实后端失败 fail-loud 边界。

## Status

- Done: 新增排产预警条重试按钮。
- Done: 重试后重新读取后端人员阻断和替班证据。
- Done: 重试成功后刷新人员约束与事件队列。
- Done: 单测 75/75、相关回归 127/127 通过。
- Done: focused 真实浏览器 1/1 通过，覆盖启动失败、重试、人员约束释放和甘特图渲染。
- Done: 相邻人员复核真实浏览器 2/2 通过，覆盖替班释放与无候选停工复核。
- Done: 员工离线入口真实浏览器 2/2 通过，确认不暴露 backend skip 技术错误。

## Next

- 将 live-mock auth/session route 边界抽成共享 helper，降低后续人员/排产 E2E 夹具重复成本。
- 继续处理 `SignalR negotiate` 页面跳转噪声。
- 补齐后端 `WO-013` 人员/生产扫描 seed，减少前端 fallback 依赖。

## Real Browser Evidence Plan Update

- Completed: focused E2E auth loop fixed by installing required live-mock routes before first protected navigation.
- Evidence: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` passed.
- Completed: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"` passed.
- Completed: `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示|backend skip"` passed.

## Release-Candidate Slice Plan

- Done: identify bounded slice files in `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.md`.
- Done: decompose the large candidate code diff into labor, dhtmlx, multi-objective, Assistant/engineering, and guidance-link themes.
- Next: split or explicitly review only the labor evidence retry/offline fallback theme before staging.
- Next: push selected head and regenerate hosted CI evidence pinned to the resulting SHA.
