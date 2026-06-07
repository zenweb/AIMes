# 2026-06-05 Admin E2E Browser Launch Flaky

## 现象
- `npm run test:e2e` 过程中，`tests/e2e/admin.spec.ts:353` 的首个治理用例出现过一次浏览器启动期 flaky。
- 表现为 `browserType.launch: Target page, context or browser has been closed`。
- 同一轮 retry 后通过，最终套件仍然是绿的。

## 影响
- 这不是稳定失败，但它说明 E2E 基线里存在一次性启动抖动，不能当成完全无风险。

## 处理状态
- 当前先记录，不改测试语义。
- 已复跑 `npm run test:e2e -- tests/e2e/admin.spec.ts`，30/30 通过；暂按一次性启动抖动处理，不继续烧时间。
