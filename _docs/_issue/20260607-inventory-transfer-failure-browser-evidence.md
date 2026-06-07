# 2026-06-07 Issue - InventoryBoard 库存调拨失败 Chromium 证据

## 问题

`InventoryBoard` 已有库存操作失败的 alert 语义基础，但缺少真实 Chromium 证据证明调拨接口失败时，弹窗不会关闭，错误会以可感知方式暴露给用户。

## 影响

如果调拨失败后弹窗关闭或错误不明显，现场用户可能误以为库存已经跨仓转移，导致库位余额、缺料判断和后续追溯出现偏差。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/inventory/transfer` 返回 503。
- 断言调拨 dialog 保留、`role="alert"` 可见、当前物料上下文仍在。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
