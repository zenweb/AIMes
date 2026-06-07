# 2026-05-31 Sprint 5 H5 Domain NotMapped Review

## 结论

- 本地审计通过：Domain 实体不再使用 EF `[NotMapped]` 注解。
- 持久化忽略规则仍由 Infrastructure Fluent API 负责，EF 模型中对应运行态属性未被映射。

## 覆盖点

- 源码门禁扫描 `MES.Domain/Entities`，阻止 `[NotMapped]` 与 `System.ComponentModel.DataAnnotations.Schema` 回流。
- EF 模型门禁确认五个运行态属性仍被忽略，避免删除注解后意外生成数据库列。
- 本轮未改实体行为方法，也未改数据库表配置。

## 剩余风险

- 历史 migration snapshot 中仍会保留历史模型快照文本，本轮未改历史迁移。
- 后续若新增运行态属性，需要同步在 Infrastructure 配置中 `Ignore(...)`，否则模型门禁需要扩展目标清单。
