# 2026-06-07 Issue - BomBoard BOM 详情加载失败 Chromium 证据

## 问题

`BomBoard` 已有 BOM 详情加载失败的组件级 fail-loud 逻辑和单元测试，但缺少真实 Chromium 证据证明列表可读、详情接口失败时不会出现空详情面板。

## 影响

如果详情失败时没有明确告警或 fallback，工程数据、替代料确认、库存齐套和排产约束会在用户点击详情后断链，影响现场排产和物料决策。

## 处理

- 新增 e2e 显式关闭 offline demo。
- mock `/api/v1/bom` 列表成功，拦截 `/api/v1/bom/bom-1` 返回 503。
- 断言 fail-loud alert、fallback 详情和 `M-AL-6061` 关键约束。

## 状态

A 轨此切片已用 Chromium 定向验证通过。B 轨发布闸门仍未关闭。
