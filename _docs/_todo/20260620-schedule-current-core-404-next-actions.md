# 2026-06-20 Todo - Schedule current 核心 404 后续

## 下一步
- 单独读取 `ScheduleBoard` 与 `scheduling` API 合同，确认 `/api/v1/scheduling/current` 的产品语义。
- 判断应由后端提供当前排产计划 seed/current，还是由前端展示页面内空状态和恢复动作。
- 不要直接 suppress `/scheduling/current` 的全局错误，除非同时提供清晰的页面内 fail-loud 提示、帮助入口和可恢复动作。
- 修复后继续用真实浏览器验证 `/scheduling/scheduling`：无 optional 404 toast、无 offline skip，核心缺失状态必须可理解。

