# 2026-06-20 员工列表离线演示包装错误静默

## 变更
- 扩展 `src/frontend/src/utils/offline-demo-mode.ts` 的 `isOfflineDemoError` 判定，支持识别 `response.data.message` / `response.data.title` 中携带的 `Offline demo mode skipped backend request:`。
- 补充 `src/frontend/tests/unit/offline-demo-mode.test.ts` 红绿测试，覆盖 HTTP/ProblemDetails 包装后的离线演示跳过错误。

## 验证
- RED：`npm run test:unit -- tests/unit/offline-demo-mode.test.ts` 先失败，确认包装响应消息未被识别。
- GREEN：`npm run test:unit -- tests/unit/offline-demo-mode.test.ts`，13 passed。
- 回归：`npm run test:unit -- tests/unit/employee-board.test.ts`，19 passed。
- Lint：`npm run lint -- src/utils/offline-demo-mode.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts` 通过。
- Diff check：`git diff --check -- src/frontend/src/utils/offline-demo-mode.ts src/frontend/tests/unit/offline-demo-mode.test.ts src/frontend/tests/unit/employee-board.test.ts` 仅有 LF/CRLF 提示。

## 影响
- `/employee` 在离线演示模式或后端跳过请求被包装时继续展示本地示例数据，不再向用户显示 `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。
