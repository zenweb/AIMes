# 2026-06-14 Issue - DTO 仍声明采纳原因可空

## 问题
- 后端运行时已拒绝空白采纳原因，但 `AdoptionFeedbackRequest.ReasonDetail` 仍是 `string?`。
- latest 已过滤不可审计反馈，但 `AdoptionFeedbackSnapshotDto.ReasonDetail` 仍是 `string?`。

## 影响
- 客户端和测试读到的契约仍暗示原因可以缺失。
- 后续维护者可能基于 DTO 可空声明重新引入不可审计反馈路径。

## 修复
- 将请求和 snapshot DTO 的 `ReasonDetail` 改为非空字符串。
- 为请求 DTO 增加 `Required` 错误信息。
- 应用服务构造 latest snapshot 前增加空原因防御。
- 增加 nullability 契约测试锁住字段必填语义。

## 剩余风险
- 历史数据中仍可能存在空原因记录；当前由 latest 过滤和应用服务防御隔离，不在本片迁移。
