# 2026-06-20 Schedule current 404 页面内告警 toast 清理

## 变更
- `getCurrentPlan()` 请求 `/scheduling/current` 时携带 `{ suppressErrorToast: true }`。
- 不吞掉 `/scheduling/current` 的异常，继续交给 `ScheduleBoard` 页面内 fail-loud 逻辑处理。
- `ScheduleBoard` 仍在后端无当前排产计划时回退演示排产数据，并在 `.warnings-bar` 展示失败原因和恢复语义。

## 验证
- 已先补红灯测试，确认 `getCurrentPlan()` 原先未 suppress 全局 toast。
- `npm run test:unit -- tests/unit/scheduling-api.test.ts tests/unit/schedule-board.test.ts`
- 待执行：`npm run build` 与真实浏览器 `/scheduling/scheduling` 复验。

