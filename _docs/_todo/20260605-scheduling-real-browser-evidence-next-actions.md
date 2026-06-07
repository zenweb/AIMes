# 2026-06-05 排产真实浏览器证据下一步

## Done

- 已完成：运行 `npm run test:e2e -- scheduling.spec.ts`。
- 已完成：确认排产 critical path 在 Chrome Playwright 下 `24 passed`。
- 已完成：归档 `_docs/_reports/scheduling-real-browser-evidence-20260605.md`。

## Next

- 下一片继续按“覆盖率增量 × 用户必经 × 业务关键度”选低覆盖关键功能，不回头细抠登录页。
- 单独处理 Nuxt 大 chunk 警告，评估是否按路由/重组件拆分。
- 发布 B 轨继续保持 fail loud：hosted CI、staging、人工安全验证/签字、灰度观察不能由前端 E2E 替代。
