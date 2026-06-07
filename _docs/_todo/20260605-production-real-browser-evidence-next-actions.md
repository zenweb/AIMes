# 2026-06-05 生产执行真实浏览器证据下一步

## Done

- 已完成：运行 `npm run test:e2e -- production.spec.ts`。
- 已完成：确认生产执行 critical path 在 Chrome Playwright 下 `21 passed`。
- 已完成：归档 `_docs/_reports/production-real-browser-evidence-20260605.md`。

## Next

- 继续按“覆盖率增量 × 用户必经 × 业务关键度”选择下一个低覆盖关键功能。
- 单独处理 Nuxt 大 chunk 警告，避免性能风险长期挂起。
- 发布 B 轨继续 fail loud：hosted CI、staging、人工安全验证/签字、灰度观察不能由生产 E2E 替代。
