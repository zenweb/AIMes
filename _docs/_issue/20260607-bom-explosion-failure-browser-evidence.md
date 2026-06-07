# 2026-06-07 Issue - BomBoard BOM 展开失败 Chromium 证据

## 问题

`BomBoard` 已有 BOM 展开失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明点击 `爆炸展开` 后接口失败时不会中断物料展开链路。

## 影响

如果 BOM 展开失败时没有明确告警或 fallback，工程数据到库存齐套、采购加急和排产约束的链路会断开，现场用户无法确认关键物料展开结果。

## 处理

- 新增 e2e 显式关闭 offline demo。
- mock `/api/v1/bom` 列表和 `/api/v1/bom/bom-1` 详情成功。
- 拦截 `/api/v1/bom/bom-1/explode` 返回 503。
- 断言 fail-loud alert 和本地展开树。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
