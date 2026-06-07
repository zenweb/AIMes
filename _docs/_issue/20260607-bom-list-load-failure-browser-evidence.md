# 2026-06-07 Issue - BomBoard BOM 列表加载失败 Chromium 证据

## 问题

`BomBoard` 已有 BOM 列表加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明首屏后端失败时用户仍能看到明确告警和本地 fallback 清单。

## 影响

如果 BOM 列表失败时没有明确告警，工程数据、排产约束、库存齐套和采购协同可能基于演示数据继续判断，用户会误以为当前 BOM 清单来自实时后端。

## 处理

- 新增 e2e 显式关闭 offline demo。
- 拦截 `/api/v1/bom` 返回 503。
- 断言 fail-loud alert 和本地 `BOM-A100` fallback 清单。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
