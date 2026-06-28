# 2026-06-21 Employee Preview Output Rebuild

- 复现 `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1` 入口空白/旧状态问题。
- 定位到当前 4173 预览服务的 HTML 指向 `/scheduling/_nuxt/AwIEAlS6.js`，但 `.output/public/_nuxt/AwIEAlS6.js` 不存在，资源请求返回 500/截断。
- 执行 `npm run build` 重新生成 `.output`，随后重启 4173 预览服务。
- 真实浏览器验证员工页离线演示入口显示本地示例人员、人员能力矩阵、关联入口和帮助提示，且不再展示 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。

## Verification
- `npm run test:unit -- tests/unit/employee-board.test.ts --maxWorkers=1 --no-file-parallelism`：19/19 passed。
- `npm run build`：passed。
- Browser: `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`：`.emp-board` 可见，`[role="alert"]` 数量为 0。

## 2026-06-21 Refresh
- 用户再次反馈同一入口显示 `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。
- 复查源码和单测后确认业务逻辑仍正确，问题仍是 4173 预览进程加载旧 `.output`。
- 重新执行 `npm run build` 并重启 4173 preview，当前 preview 进程为 `20720`。
- 真实 Chromium 直连 `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1` 验证：`.emp-board=1`、`.skill-matrix-panel=1`、`[role="alert"]=0`，不包含 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。

## 2026-06-21 Second Refresh
- 用户再次看到同类 employee offline demo skip 文案后，复查确认源码层仍通过静默降级测试。
- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts`：35/35 passed。
- `npm run build`：passed，随后停止旧 4173 preview 并重启，新 preview 进程为 `50488`。
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示入口|backend skip"`：2/2 passed。
- 真实 Chromium 直连 `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`，按离线演示账号 `admin/admin123` 登录后返回员工页：员工卡片 8 张、`.skill-matrix-panel=1`、`[role="alert"]=0`，不包含 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。

## 2026-06-21 Third Refresh
- 用户再次反馈员工列表显示 `Offline demo mode skipped backend request: /api/v1/employee` 后，复查确认 4173 仍是预览包/进程刷新风险，不是 Docker、gh 或后端环境缺失。
- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts`：35/35 passed。
- `npm run build`：passed；停止旧 4173 preview 后重启，新 preview 进程为 `39148`。
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示员工入口|显式离线演示入口"`：2/2 passed。
- 当前可访问入口：`http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`。
