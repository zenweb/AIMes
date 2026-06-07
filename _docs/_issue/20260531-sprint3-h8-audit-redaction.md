# 2026-05-31 Sprint 3 H8 Issue

## 已处理

- 问题：`AuditRedaction` 是 internal 类型，缺少直接单元测试入口。
  - 处理：`MES.Api` 对 `MES.Tests.Unit` 开放 `InternalsVisibleTo`，新增脱敏测试。
- 问题：H8 需要证明 endpoint audit 链路不会写入明文密码。
  - 处理：Admin 创建用户集成测试读取真实 `AuditLog.NewValues`，断言包含脱敏标记且不含请求密码。

## 待跟踪

- 字段名之外的敏感值检测仍未覆盖，如普通 `Value` 字段中携带 token；如需防御需另开策略。
- H4 后续删除 `AuditAttribute` 死代码，避免旧审计路径混淆维护者判断。
