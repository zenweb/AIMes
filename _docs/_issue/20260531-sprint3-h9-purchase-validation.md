# 2026-05-31 Sprint 3 H9 Issue

## 已处理

- 问题：Purchase submit/confirm/cancel 缺少 `ValidationEndpointFilter`，与 Sprint 3 H9 端点层校验要求不一致。
  - 处理：三条状态变更 endpoint 均补 `AddEndpointFilter<ValidationEndpointFilter>()`，并新增架构门。

## 待跟踪

- 若后续为 submit/confirm/cancel 增加请求体 DTO，需要同步补 FluentValidation validator，让当前过滤器真正执行字段级校验。
- Purchase 状态机非法流转仍应由应用服务/领域层测试覆盖，端点过滤器不替代领域规则。
