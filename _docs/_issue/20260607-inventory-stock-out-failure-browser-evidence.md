# 2026-06-07 Issue - InventoryBoard 库存出库失败 Chromium 证据

## 问题

`InventoryBoard` 已有出库失败的组件级 alert 语义单元测试，但缺少真实 Chromium 证据证明出库接口失败时，弹窗不会关闭，错误会以可感知方式暴露给用户。

## 影响

如果出库失败后弹窗关闭或错误不明显，现场用户可能误以为库存已经扣减，导致账实不一致、缺料判断错误或后续追溯困难。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/inventory/stock-out` 返回 503。
- 断言出库 dialog 保留、`role="alert"` 可见、当前物料上下文仍在。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
