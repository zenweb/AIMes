# 2026-05-31 Sprint 5 H5 Domain NotMapped Issue

## 已处理

- 问题：Domain 实体通过 `[NotMapped]` 表达 EF 持久化细节。
  - 风险：Domain 层耦合 EF DataAnnotations，违反 Sprint 5 H5 的分层目标。
  - 处理：移除注解和 Schema using，持久化忽略规则保留在 Infrastructure Fluent API。

## 未关闭事项

- 没有为历史 migration 文件做重写；这是既有迁移历史，不应为本切片回写。
- 尚未全面审计 Domain 层其它 EF/DataAnnotations 属性，本轮只覆盖 H5 明确的 `[NotMapped]`。
