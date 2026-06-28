# Issue: 员工列表离线演示错误被包装后泄漏到 UI

## 现象
- 页面显示：`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。

## 根因
- `EmployeeBoard.vue` 已经对 `isOfflineDemoError(error)` 做静默 fallback。
- 但实际错误可能被 HTTP/响应层包装到 `response.data.message` 或 `response.data.title`，旧判定只识别错误类、code、name 和顶层 message。

## 修复
- `isOfflineDemoError` 增加对 `response.data.message/title` 的前缀识别。

## 证据
- 红灯测试先失败于包装响应消息识别。
- 修复后 `offline-demo-mode.test.ts` 和 `employee-board.test.ts` 均通过。
