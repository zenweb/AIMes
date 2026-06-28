# 2026-06-14 Issue - BOM 启动工程证据失败阻断列表

## 问题
- `BomBoard.vue` 的 mounted hook 串行 `await` 三个启动工程证据源。
- 任一证据源抛错时，后续 `loadBoms()` 不执行，导致 BOM 主列表无法加载。

## 影响
- BOM 管理是工程数据与库存齐套、排产、OTD 证据链的用户关键路径。
- 辅助证据源故障不应让 BOM 主列表不可用。

## 修复
- 新增 `loadStartupEngineeringEvidence()`，逐项捕获失败并汇总为一条 fail-loud 告警。
- mounted hook 先加载启动证据，再始终执行 `loadBoms()`。

## 状态
- 已修复并验证通过。
