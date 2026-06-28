# 2026-06-14 Issue - 多目标对比缺 plan 用例被公式契约提前拦截

## Problem
- Chromium 全量中 `多目标方案优化缺少计划时真实浏览器保留待采纳状态` 失败。
- 页面没有出现 `.recommend-card`。
- Playwright error-context 显示弹窗 alert 为：`批量优化对比失败: 后端推荐公式说明缺失或无效`。

## Root Cause
- 测试 mock 的 `optimize-compare` response 缺少 `recommendationScoreFormula`。
- 组件按当前产品契约正确拒绝该 response，因此测试未进入真正要覆盖的 `/optimize` 缺少 `plan` 路径。

## Resolution
- 在该 mock 中补齐公式版本、三项权重、换线归一化分钟和说明。
- 保持组件 fail-loud 校验不变。

## Status
- Closed by E2E mock contract fix.
- Chromium 全量验证：415 passed, 2 skipped。
