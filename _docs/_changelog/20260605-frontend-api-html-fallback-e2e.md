# 2026-06-05 Frontend API HTML Fallback E2E

## 变更
- 在前端 HTTP 响应边界识别 `text/html` / `<!doctype html>` API fallback，避免 Nuxt preview 把 SPA HTML 当业务 JSON 继续渲染。
- 在 `ScheduleBoard` 为排产计划和设备分页增加运行时载荷守卫，坏载荷直接进入演示排产 fallback。
- Vue 全局运行时错误处理同步输出 `console.error`，保留 toast，同时让 E2E/浏览器控制台能看到栈。

## 验证
- `npm run test:e2e -- tests/e2e/demo-smoke.spec.ts --grep "Dashboard -> Scheduling -> Audit -> Report" --workers=1 --reporter=list`：1 passed。
- `npm run test:e2e -- tests/e2e/audit.spec.ts tests/e2e/chat.spec.ts tests/e2e/demo-smoke.spec.ts tests/e2e/report.spec.ts --grep "回放后端 Agent execute|空状态显示|Dashboard -> Scheduling -> Audit -> Report|POC 复盘签署后" --workers=1 --reporter=list`：4 passed。
- `npm run lint`：通过。
