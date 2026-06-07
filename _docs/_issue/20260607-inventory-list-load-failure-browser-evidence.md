# 2026-06-07 Issue - InventoryBoard 库存列表加载失败 Chromium 证据

## 问题

`InventoryBoard` 已有库存列表加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明首屏后端失败时用户仍能看到明确告警和本地 fallback 物料。

## 影响

如果库存列表失败时没有明确告警，缺料齐套、出入库操作和工单物料判断可能基于演示数据继续推进，用户会误以为当前库存来自实时后端。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/inventory` 返回 503。
- 断言 fail-loud alert 和本地 `MAT-A01` fallback 物料。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
