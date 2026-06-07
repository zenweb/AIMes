# 2026-06-07 Issue - InventoryBoard 库存交易记录加载失败 Chromium 证据

## 问题

`InventoryBoard` 已有库存交易记录加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明用户选择物料后，后端交易记录失败时仍能看到明确告警和当前物料 fallback 交易。

## 影响

如果交易记录失败时没有明确告警，仓库、生产和审计人员可能把本地演示流水误认为实时库存追溯，影响领料核对、余额判断和后续问题追查。

## 处理

- 新增 e2e 在点击物料前显式关闭 offline demo。
- 拦截 `/api/v1/inventory/transactions` 返回 503。
- 断言 fail-loud alert 和当前物料 `MAT-A01` fallback 交易。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
