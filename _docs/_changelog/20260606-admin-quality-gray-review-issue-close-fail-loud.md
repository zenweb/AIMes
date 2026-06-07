# 20260606 Admin 质量灰度复核问题单关闭 fail-loud

## 更新

- 修复 `AdminBoard` Agent 治理质量灰度复核问题单关闭失败时无提示的问题。
- 补充负样本并关闭写入失败时保持原问题单状态，并通过 `role="alert"` 提示失败原因。
- 关闭写入成功但灰度决策列表或 OTD 证据刷新失败时显示刷新失败提示，避免管理员误判页面状态。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/admin-board.test.ts
npm.cmd run test:unit:coverage
npm.cmd run test:e2e -- tests/e2e/admin.spec.ts
```

- `admin-board.test.ts`：14 passed。
- 全量覆盖率：84 files / 530 tests passed。
- admin Chromium e2e：30 passed。
- `AdminBoard.vue` 覆盖率：statements 76.51%，branches 37.64%，functions 50.93%，lines 79.38%。

## 未关闭事项

- Hosted CI 未证明。
- PostgreSQL/staging 演练未证明。
- Attack Chain A/B/C 人工验证未证明。
- 安全签字未证明。
- 首次灰度和 14 天 P0/P1 观察窗口未证明。
