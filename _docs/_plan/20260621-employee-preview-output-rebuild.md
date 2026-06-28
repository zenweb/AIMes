# Plan - Employee Preview Output Rebuild

## Success Criteria
- 员工页 offline demo 可通过 4173 入口访问。
- 页面展示本地示例员工和人员能力矩阵。
- 不暴露 `Offline demo mode skipped backend request`。
- 不在源码里做无依据改动。

## Steps
1. 读取员工页、offline demo 判定、HTTP 拦截器和单测，确认源码预期。
2. 运行员工页单测，确认逻辑层未回归。
3. 检查 4173 预览进程、HTML 引用资源和 `.output/public/_nuxt` 资源一致性。
4. 重新 build 并重启预览服务。
5. 用真实浏览器验证 4173 入口。

## Status
- Completed: 源码逻辑确认、单测、生产 build、4173 重启、真实浏览器 smoke。
- Remaining: 后续功能切片继续执行时，需要在交付入口前重复构建/预览 smoke。

## Refresh Status
- 2026-06-21 用户再次反馈后已重复执行同一闭环：源码确认、focused unit、focused E2E、生产 build、4173 preview 重启、真实 Chromium smoke。
- 当前 4173 员工入口满足成功标准；后续继续推进排产人员证据重试真实浏览器证据。
- 2026-06-21 二次反馈后再次执行闭环：unit 35/35、build passed、focused E2E 2/2、4173 真实 Chromium 离线演示登录 smoke passed。当前 4173 员工入口继续满足成功标准。
- 2026-06-21 三次反馈后再次执行闭环：unit 35/35、build passed、focused E2E 2/2、4173 preview 进程 `39148` 已启动。当前入口继续满足成功标准。
