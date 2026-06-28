# 2026-06-14 Plan - 批量方案采纳提示竞态修复

## 成功标准
- 迟到的初始排产加载失败不得覆盖用户采纳批量对比方案后的 warning。
- 批量方案反馈同步失败时，真实浏览器仍展示本地目标切换、反馈失败原因和 `综合平衡方案已应用`。
- 完整 scheduling Chromium 不再因该用例 retry。
- 覆盖率、diff 检查、敏感信息扫描和关键文本审计完成。

## 执行步骤
- 已定位根因：旧 `loadData` 结果可在用户采纳后迟到写回。
- 已用单测复现竞态并确认 RED。
- 已添加 `scheduleStateVersion` 和 mounted 初始版本固定逻辑。
- 已完成窄范围 GREEN、完整 `ScheduleBoard` 单测、目标 Chromium、完整 scheduling Chromium 和覆盖率验证。

## 停止条件
- 本片在审计通过后停止，不扩大到新模块。
