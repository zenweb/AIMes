# 2026-06-14 Changelog - MainLayout 壳层覆盖率杠杆

## 变更
- 按覆盖率杠杆从 `ChatPanel` 转向全站用户必经的 `MainLayout`。
- 补充暗色模式从 `localStorage` 恢复并可再次持久化切换的单元测试。
- 补充退出登录时断开通知连接、调用 auth logout、跳转 `/login` 的单元测试。

## 验证
- `npm run test:unit -- tests/unit/main-layout.test.ts`：3 passed。
- `npm run test:unit:coverage`：105 files / 751 tests passed。
- 覆盖率：总 lines 83.59%，`MainLayout.vue` lines 88.23%，branches 75.47%，functions 72.72%。

## 说明
- `npm run test:unit:coverage -- tests/unit/main-layout.test.ts` 的测试本身 3 passed，但由于只跑一个文件且仍套用全局 coverage 阈值，命令退出 1；完整 coverage 已通过。
- 15 天灰度观察按 owner 指令后置，不作为当前继续工作的阻塞项。
