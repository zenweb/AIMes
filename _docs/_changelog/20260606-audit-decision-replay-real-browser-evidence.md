# 20260606 AuditDecisionReplayPanel 真实浏览器证据

## 更新

- 刷新 `AuditDecisionReplayPanel` 真实 Chromium e2e 证据。
- 确认 `tests/e2e/audit.spec.ts` 在生产构建后 12/12 通过。
- 记录审计回放真实浏览器路径当前未暴露回归失败，下一步应继续按覆盖率杠杆选片。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts
```

- Nuxt production build 成功。
- Chromium：12 passed。
- 最大 JS chunk：817.50 kB。

## 未关闭事项

- Hosted CI 未证明。
- PostgreSQL/staging 演练未证明。
- Attack Chain A/B/C 人工验证未证明。
- 安全签字未证明。
- 首次灰度和 14 天 P0/P1 观察窗口未证明。
