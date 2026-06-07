# 2026-06-07 Issue - POC 复盘签署载荷缺失缺少真实浏览器证据

## 问题

`AuditDecisionReplayPanel` 已有单元测试覆盖 POC 复盘签署载荷缺失，但缺少真实 Chromium 证据。

## 影响

缺失签署审计载荷如果在浏览器路径中被静默吞掉，会削弱 POC 复盘、客户验收和发布签字可信度。

## 处理

- 新增 Chromium e2e 构造一条缺少 `reviewers` 和 `evidenceBatches` 的 POC 复盘签署记录。
- 验证页面保留基础回放卡片。
- 验证缺失载荷签署记录不会生成回放卡片。
- 验证 `.replay-sync-alert` 展示 POC 复盘签署加载失败和具体缺失载荷编号。

## 状态

已通过定向真实 Chromium e2e。
