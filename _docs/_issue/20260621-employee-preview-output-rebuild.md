# Issue - Employee Preview Output Rebuild

## Problem
- 员工页显示或曾显示 `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。
- 真实浏览器直接访问 4173 时，页面一度只有 HTML shell，客户端主体未渲染。

## Root Cause
- 4173 预览服务使用的 `.output` 与 HTML 引用的客户端资源不一致。
- HTML 引用了 `/scheduling/_nuxt/AwIEAlS6.js`，但 `.output/public/_nuxt/AwIEAlS6.js` 缺失，资源请求返回 500/响应截断。
- 源码层员工页 offline demo 容错本身已通过单测，根因不是继续精修员工页逻辑。

## Resolution
- 重新运行 `npm run build` 生成当前 `.output`。
- 停止旧 4173 Node 预览进程并启动新的 `node ./scripts/preview.mjs`。

## Verification
- EmployeeBoard unit: 19/19 passed。
- Production build: passed。
- Real browser: `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1` 显示员工示例数据，`[role="alert"]` 为 0。

## 2026-06-21 Recheck
- 同类用户反馈再次出现后，复验发现源码层仍通过：`employee-board.test.ts` 19/19 passed，focused employee offline-demo E2E 1/1 passed。
- 重新 build 并重启 preview 后，真实 Chromium 返回：`hasEmployeeBoard=1`、`hasSkillMatrix=1`、`alerts=0`、`containsLoadFailure=false`、`containsOfflineSkip=false`、`containsEmp001=true`、`containsEmp006=true`。
- 本问题仍归类为预览产物/进程刷新问题，不归类为员工页业务逻辑回归。

## 2026-06-21 Second Recheck
- 用户再次反馈同类文案后，二次复验仍证明源码和运行入口可闭环。
- Unit: `employee-board.test.ts` + `offline-demo-mode.test.ts` 35/35 passed。
- E2E: focused employee offline-demo/backend-skip group 2/2 passed。
- 4173 真实 Chromium：离线演示登录后员工页显示 8 张员工卡，0 个 alert，未包含 `员工列表加载失败` 或 `Offline demo mode skipped backend request`。
- 剩余风险仍是操作流程风险：源码变更或 build 后未重启 4173 preview 会继续服务旧 bundle。

## 2026-06-21 Third Recheck
- 再次复验：focused unit 35/35 passed，production build passed，focused employee offline-demo E2E 2/2 passed。
- 4173 preview 当前监听进程为 `39148`，入口继续使用 `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`。
- 结论不变：这是预览包刷新/入口交付流程风险，不是需要安装额外软件或配置 Docker/GitHub CLI 的问题。
