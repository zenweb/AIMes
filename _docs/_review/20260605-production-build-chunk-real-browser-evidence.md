# 2026-06-05 生产构建拆包真实浏览器证据审查

## Review Result

- 结论：PASS。
- 本轮只调整 Nuxt `manualChunks`，目标是消除生产构建中超过 900KB 的 chunk 警告。
- 选片依据：生产执行看板是用户必经路径；构建产物体积警告属于既有功能精品级质量证据，而不是新增功能。

## Verified

- `npm run build`：PASS。
- 最大 JS chunk 从 `911.05 kB` 降到 `817.49 kB`。
- 接受版本未观察到 `Some chunks are larger than 900 kB after minification`。
- 接受版本未观察到 `Circular chunk`。
- `npm run test:e2e -- production.spec.ts`：Chromium 下 `21 passed`。

## Rejected

- 拆出 `primevue-theme` 会产生 `primevue -> primevue-theme -> vendor -> primevue` 循环。
- 拆出 `primevue` 会产生 `primevue -> vendor -> primevue` 循环。
- 因此保留 PrimeVue 在 `vendor`，只拆 Vue 核心。

## Residual Risk

- 这是前端构建/真实浏览器质量切片，不是发布完成证明。
- 发布 B 轨仍由 hosted CI、PostgreSQL/staging、人工 attack-chain 验证、安全签字、灰度观察窗口阻断。
