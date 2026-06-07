# 2026-05-31 Sprint 2 M5 问题记录

## 已解决

- 问题：`Material` 属性暴露 `internal set`。
  - 影响：同程序集代码可绕过领域行为直接修改库存、预留量、安全库存等状态。
  - 处理：全部收紧为 `private set`，状态变化保留在 `Create`、`Reserve`、`Release`、`Consume`、`StockIn` 等行为方法中。

- 问题：测试代码通过对象初始化器直接构造 `Material`。
  - 影响：实体 setter 收紧后测试编译失败，也暴露测试未表达领域行为意图。
  - 处理：单元测试、集成测试和种子数据改用 `Material.Create(...)`；需要预留量的场景用 `Reserve(...)`。

## 过程中发现

- `ExpiryDate` 原测试直接赋值，但领域模型当前没有设置过期日期的行为入口。
  - 处理：本轮不新增业务能力，测试调整为确认默认 `ExpiryDate` 为空。

## 未解决

- 是否需要为 `Material` 引入批次/过期日期领域行为，仍需后续业务设计确认。
- 其它未点名实体是否还存在非必要 `internal set`，可在后续 M 类治理中扩展。
- OMX 外部代理审计仍不可用：缺 `C:\Users\陈奕铭\.codex\prompts`。
