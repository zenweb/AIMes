# Review - Employee Preview Output Rebuild

## Scope
- 本轮没有修改业务源码。
- 处理范围限定为员工页可访问入口的生产预览产物和 4173 预览进程。

## Findings
- 源码层已存在离线演示容错：`EmployeeBoard.vue` 对 `isOfflineDemoError(error)` 不展示内部 skip 错误，并回退本地示例员工。
- 单测 `employee-board.test.ts` 已覆盖裸 `OfflineDemoApiError` 和 HTTP 包装错误两种路径。
- 用户看到的现象来自 `.output` 产物与 HTML manifest 不一致：入口 chunk 缺失导致浏览器无法加载当前客户端脚本。

## Validation
- Unit: employee board 19/19 passed。
- Build: Nuxt production build passed。
- Real browser: 4173 员工页 offline demo 已显示人员数据，未显示 alert。
- 2026-06-21 复验：`npm run test:unit -- employee-board.test.ts` 19/19 passed；focused employee offline-demo E2E 1/1 passed；重新 build 和重启 preview 后，真实 Chromium 直连 4173 员工入口显示 `EMP-001`、`EMP-006`，且 `员工列表加载失败` / `Offline demo mode skipped backend request` 均为 false。
- 2026-06-21 二次复验：`npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts` 35/35 passed；`npm run build` passed；`npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示入口|backend skip"` 2/2 passed；4173 真实 Chromium 登录离线演示后显示 8 张员工卡、0 个 alert，未出现 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。
- 2026-06-21 三次复验：同一 focused unit 35/35 passed；`npm run build` passed；focused employee offline-demo E2E 2/2 passed；4173 preview 已重启到进程 `39148`。

## Residual Risk
- 如果后续修改源码后没有重新 `npm run build` 并重启预览，4173 仍可能继续服务旧产物。
- 4173 是静态生产预览，不会热更新源码改动；任何可访问入口交付前必须把 build/restart/smoke 作为同一个动作包执行。
