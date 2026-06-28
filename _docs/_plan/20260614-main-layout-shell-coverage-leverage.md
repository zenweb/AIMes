# 2026-06-14 Plan - MainLayout 壳层覆盖率杠杆

## Success Criteria
- 不新增业务功能，只补现有壳层行为测试。
- 暗色模式偏好能从 `localStorage` 恢复，并且切换后重新持久化。
- 退出登录会断开通知连接、清理认证态并跳转登录页。
- 单文件测试和完整 coverage 都通过。

## Execution
- 读取 `MainLayout.vue` 与现有 `main-layout.test.ts`。
- 补两个用户关键行为测试。
- 先跑单文件测试，再跑完整 coverage 防止全局阈值误判。

## Stop Condition
- 完整 `npm run test:unit:coverage` 通过后停止本片。
