# 2026-06-14 Issue - 应用服务可绕过端点写入空采纳原因

## 问题
- API 端点已拒绝空白 `ReasonDetail`，但 `SchedulingAppService.RecordAdoptionFeedbackAsync` 本身仍未校验。
- 非 HTTP 调用或未来内部调用可能绕过端点，继续写入不可审计采纳反馈。
- 单测红灯显示旧逻辑会继续调用证据写入，并因 mock feedback 为空触发 NRE，而不是明确拒绝业务输入。

## 影响
- 采纳反馈原因必填契约只存在于 HTTP 边界，应用层不自洽。
- Agent evidence link 和审计日志仍可能被空原因反馈污染。

## 修复
- 在应用服务入口增加 `string.IsNullOrWhiteSpace(request.ReasonDetail)` 校验。
- 空原因抛出 `ArgumentException("修改原因说明不能为空", nameof(request))`。
- 单测断言拒绝发生在 feedback service、仓储、evidence link、audit log 调用之前。

## 剩余风险
- 历史数据中仍可能存在空原因记录；当前由读取端过滤和应用服务防御处理，不在本片迁移。
