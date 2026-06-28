# Plan: 员工列表离线演示包装错误静默

## 成功标准
- 员工列表遇到离线演示跳过请求时展示本地示例数据。
- 不显示 `Offline demo mode skipped backend request` 或“员工列表加载失败”。
- 普通后端错误仍然 fail loud，继续提示用户。

## 执行
1. 读取 `EmployeeBoard.vue`、`offline-demo-mode.ts`、`http.ts` 和员工页测试。
2. 写红灯测试覆盖 `response.data.message/title` 包装形态。
3. 最小扩展 `isOfflineDemoError`。
4. 跑工具测试、员工页测试、lint、diff check。

## 状态
- 已完成。
