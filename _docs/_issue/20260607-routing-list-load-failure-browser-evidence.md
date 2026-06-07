# 2026-06-07 Issue - RoutingBoard 工艺路线列表加载失败 Chromium 证据

## 问题

`RoutingBoard` 已有工艺路线列表加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明首屏后端失败时用户仍能看到明确告警和本地 fallback 路线清单。

## 影响

如果工艺路线列表失败时没有明确告警，工程数据和 AI 排产可能基于演示路线继续判断，用户会误以为当前路线约束来自实时后端。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/routing` 返回 503。
- 断言 fail-loud alert、`aria-live="assertive"` 和本地三条工艺路线 fallback 清单。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
