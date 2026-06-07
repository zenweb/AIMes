# 2026-06-05 Admin E2E Browser Launch Flaky Changelog

## Admin E2E 启动抖动确认

- 选片结果：`tests/e2e/admin.spec.ts` 曾在一次完整 `npm run test:e2e` 过程中出现单次浏览器启动期 flaky。
- 处理方式：不修改测试语义，不改业务代码，先做同目标复测确认是否可复现。
- 复测结果：`npm run test:e2e -- tests/e2e/admin.spec.ts` 通过，`30 passed`。
- 结论：当前按一次性启动抖动归档，不作为阻断项。

## Release Boundary

- 这不是 v1 发布门的功能修复项，也不替代 hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
