# 2026-05-31 Sprint 3 M12 Issue

## 已处理

- 问题：领域实体规则违反使用泛化 `InvalidOperationException`，不利于 API 映射和审计分类。
  - 处理：新增 `DomainRuleViolationException`，替换 Domain `Entities` 下的领域规则抛出，并在 `ExceptionMiddleware` 中显式映射。

## 待跟踪

- Application 层仍有 `InvalidOperationException` 表达资源不存在或用例流程错误；如需统一错误模型，建议在后续切片引入应用层异常类型。
- 如果客户端需要基于错误类型做精细处理，应补对应 API 集成测试。
