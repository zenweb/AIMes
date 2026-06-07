# 2026-06-07 Issue - RoutingBoard 工艺路线详情加载失败 Chromium 证据

## 问题

`RoutingBoard` 已有工艺路线详情加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明用户点击路线后，后端详情失败时仍能看到明确告警和本地 fallback 工序。

## 影响

如果详情失败时没有明确告警，工程师和计划员可能把本地演示工序当作实时路线约束，影响设备能力、质量门、节拍和 AI 排产解释。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 让列表接口返回 `R-A100`，拦截 `/api/v1/routing/r-1` 返回 503。
- 断言 fail-loud alert、`aria-live="assertive"` 和本地 `R-A100` 工序 fallback 详情。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
