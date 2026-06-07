# 2026-06-07 Issue - 未知业务落库资源缺少真实浏览器证据

## 问题

`AuditDecisionReplayPanel` 已有单元测试覆盖未知 `businessWrite.resource`，但缺少真实 Chromium 证据。

## 影响

未知业务落库资源如果在浏览器路径中被静默吞掉，会削弱发布签字和审计回放可信度。

## 处理

- 新增 Chromium e2e 构造一条成功 `purchase-order` 审计和一条未知 `warehouse-transfer` 审计。
- 验证页面保留成功采购落库回放。
- 验证 `.replay-sync-alert` 展示业务落库审计详情加载失败和具体未知资源。

## 状态

已通过定向单元测试和真实 Chromium e2e。
