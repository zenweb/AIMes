# 2026-06-05 Admin E2E Browser Launch Flaky Review

## 审计结论

- `tests/e2e/admin.spec.ts` 在一次完整 `npm run test:e2e` 过程中出现过单次浏览器启动期 flaky。
- 现象是 `browserType.launch: Target page, context or browser has been closed`，但同一轮 retry 后通过，最终套件仍为绿灯。
- 这类失败更像 E2E 启动抖动，而不是稳定的功能回归；当前不改测试语义，不继续烧时间追一类不可复现问题。

## 复测证据

- 已复跑 `npm run test:e2e -- tests/e2e/admin.spec.ts`。
- 结果：`30 passed`。
- 该复测覆盖了同一组 `Admin Agent 治理` 端到端用例，未复现启动期 flaky。

## 处理结论

- 目前按一次性启动抖动处理，不升级为代码缺陷。
- 若后续再次复现，应优先检查 Playwright/Chromium 启动稳定性，而不是先改业务逻辑。
