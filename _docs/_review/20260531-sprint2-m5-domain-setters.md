# 2026-05-31 Sprint 2 M5 领域 Setter 审计

## 审计范围

- `MES.Domain.Entities.Production.Material`
- `MES.Domain.Entities.Quality.QualityInspection`
- `MES.Domain.Entities.Scheduling.SchedulePlan`
- 受 M5 影响的 Material 单元测试、库存应用单元测试、库存/扫码集成测试与集成测试种子

不纳入本轮结论：其它领域实体 setter 全量收紧、`ExpiryDate` 业务设置能力设计、前端和 AI 相关脏工作树改动。

## 结论

- Code review 本地结论：APPROVE。
- Architecture 本地结论：CLEAR。
- 最终建议：APPROVE for Sprint 2 M5 target domain setter slice。

## 检查点

- `Material` 已不再允许程序集内通过 `internal set` 绕过 `Reserve`、`Consume`、`StockIn` 等领域行为。
- `QualityInspection` 与 `SchedulePlan` 已保持 `private set`，未做无关改动。
- 测试数据改为使用 `Material.Create(...)` 和 `Reserve(...)`，保留原可用库存、安全库存、库位、物料类型与预留库存语义。
- 架构门使用反射检查目标实体属性 setter，覆盖 M5 点名实体。
- 定向集成、单元与完整架构测试均已通过。

## 工具限制

- `oh-my-codex:code-review` 外部双 lane 当前不可用，原因仍是 `C:\Users\陈奕铭\.codex\prompts` 缺失。
- 本轮没有伪造外部 agent 审计结论，采用本地 code-review / architecture 双视角并记录限制。

## 遗留风险

- 架构门只覆盖 M5 点名的三个实体，不是全领域实体 setter 分析器。
- `Material.ExpiryDate` 仍没有领域方法设置入口；若后续业务需要到期批次能力，应单独设计行为方法或批次实体。
- 集成测试种子文件已有前序非 M5 改动，本轮只在当前状态上修复 Material 构造方式，没有回滚无关变更。
