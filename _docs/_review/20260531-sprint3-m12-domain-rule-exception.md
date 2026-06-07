# 2026-05-31 Sprint 3 M12 Review

## 审查结论

- Domain 实体层的规则违反已从泛化 `InvalidOperationException` 收敛到 `DomainRuleViolationException`。
- API 异常中间件显式映射领域规则违反为 400，便于审计和客户端区分。
- 架构门只扫描 `MES.Domain/Entities`，聚焦本轮领域实体范围。

## 风险与边界

- 新异常继承 `InvalidOperationException`，旧测试和调用方仍可按基类捕获；如果后续要更严格区分，需要逐步更新调用方断言。
- 参数错误仍使用 `ArgumentException` / `ArgumentOutOfRangeException`，本轮不改变输入参数校验语义。
- Application 层的业务用例错误仍有 `InvalidOperationException`，后续如需要可单独拆分应用层异常。

## 验证记录

- M12 架构门：1/1 通过。
- 领域相关单元测试切片：113/113 通过。
- 完整架构测试：20/20 通过。
- 后端 API build：0 warnings / 0 errors。
- `git diff --check`：通过，仅 LF/CRLF 提示。
