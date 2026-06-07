# 20260606 Admin 质量灰度决策 fail-loud

## 更新

- 修复 `AdminBoard` Agent 治理质量推荐灰度决策失败时无提示的问题。
- 灰度扩大/回滚写入失败时保持原监控卡片状态，并通过 `role="alert"` 提示失败原因。
- 决策写入成功但灰度决策列表或 OTD 证据刷新失败时显示刷新失败提示，避免管理员误判页面状态。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/admin-board.test.ts
npm.cmd run test:unit:coverage
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- `admin-board.test.ts`：12 passed。
- 全量覆盖率：84 files / 528 tests passed。
- admin Chromium e2e：30 passed。
- `AdminBoard.vue` 覆盖率：statements 75.92%，branches 35.38%，functions 46.58%，lines 79.12%。

## 未关闭事项

- Hosted CI 未证明。
- PostgreSQL/staging 演练未证明。
- Attack Chain A/B/C 人工验证未证明。
- 安全签字未证明。
- 首次灰度和 14 天 P0/P1 观察窗口未证明。
