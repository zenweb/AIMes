# 2026-06-20 员工列表离线演示跳过请求静默兜底

## 变更

- 员工列表在 offline demo mode 跳过 `/api/v1/employee` 后，保持本地员工示例数据可见，不再向用户显示 `Offline demo mode skipped backend request`。
- `offline-demo-mode` 识别器覆盖直接错误、按名称标记的错误，以及 HTTP 层包装后仍保留 skip 文案的错误。
- 重启 `127.0.0.1:4173` 预览服务，排除旧 Nuxt 预览进程继续服务旧页面状态。

## 验证

- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts`：31 passed。
- `npm run lint -- src/components/employee/EmployeeBoard.vue src/utils/offline-demo-mode.ts tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts`：PASS。
- `git diff --check -- src/frontend/src/components/employee/EmployeeBoard.vue src/frontend/src/utils/offline-demo-mode.ts src/frontend/tests/unit/employee-board.test.ts src/frontend/tests/unit/offline-demo-mode.test.ts`：PASS，仅 CRLF 提示。
- 真实浏览器打开 `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`，Admin 演示登录态下显示本地员工卡片，页面无 `员工列表加载失败`，无 `Offline demo mode skipped backend request`，无 `[role="alert"]`。

## 边界

- 这不是严格 v1.0.0 完成声明；灰度 14 天观察仍是最终发布门禁。
- 若用户浏览器仍显示旧告警，优先清理该站点缓存/本地状态或确认是否命中旧预览进程。
