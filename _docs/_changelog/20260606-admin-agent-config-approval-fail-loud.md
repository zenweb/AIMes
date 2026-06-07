# 20260606 Admin Agent 配置审批 fail-loud

## 更新

- 修复 `AdminBoard` Agent 治理关键配置审批失败时无提示的问题。
- 审批写入失败时保持原审批状态，并通过 `role="alert"` 提示失败原因。
- 审批写入成功但刷新失败时提示审批列表刷新失败，避免管理员误判当前治理状态。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/admin-board.test.ts
npm.cmd run test:unit:coverage
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- `admin-board.test.ts`：11 passed。
- 全量覆盖率：84 files / 527 tests passed。
- admin Chromium e2e：30 passed。

## 未关闭事项

- Hosted CI 未证明。
- PostgreSQL/staging 演练未证明。
- Attack Chain A/B/C 人工验证未证明。
- 安全签字未证明。
- 首次灰度和 14 天 P0/P1 观察窗口未证明。
