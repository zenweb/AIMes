# Todo: 员工列表离线演示包装错误静默后续

## 已完成
- [x] 修复离线演示跳过错误被包装后泄漏到员工页 UI。
- [x] 补充工具层红绿测试。
- [x] 回归员工页组件测试。

## 后续建议
- [ ] 在真实浏览器里重新打开 `/scheduling/employee`，确认用户看不到 `Offline demo mode skipped backend request`。
- [ ] 如果现场目标是连接真实后端而不是离线演示，需要确认 `aimes_offline_demo` 本地开关是否为 `false`，并验证 `/api/v1/employee` 后端返回真实分页数据。
