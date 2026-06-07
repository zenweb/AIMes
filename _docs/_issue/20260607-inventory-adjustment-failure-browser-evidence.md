# 2026-06-07 Issue - InventoryBoard 库存盘点失败 Chromium 证据

## 问题

`InventoryBoard` 已有库存操作失败的 alert 语义基础，但缺少真实 Chromium 证据证明盘点接口失败时，弹窗不会关闭，错误会以可感知方式暴露给用户。

## 影响

如果盘点失败后弹窗关闭或错误不明显，现场用户可能误以为库存盘点已经调整，导致账实差异被隐藏，影响后续出入库、缺料判断和审计追溯。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/inventory/adjust` 返回 503。
- 断言盘点调整 dialog 保留、`role="alert"` 可见、当前物料上下文仍在。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
