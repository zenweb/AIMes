# 2026-06-05 Plan - Barcode Print Board Inventory Load Fail Loud

## Success Criteria

- 库存列表加载失败时必须显式告警。
- demo 追溯标签与打印入口仍可使用。
- 修改后相关单测与 lint 通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增库存加载失败 alert。
- 已完成：保留 demo 数据兜底。
- 已完成：目标单测 `4 passed`。
- 已完成：`npm run lint` 通过。

## Boundary

- 本计划只补条码打印入口静默回退，不替代 hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
