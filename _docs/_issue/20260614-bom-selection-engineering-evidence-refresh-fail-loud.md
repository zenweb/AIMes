# 2026-06-14 Issue - BOM 选择工程证据刷新失败阻断详情

## 问题
- `BomBoard.vue` 的 `selectBom()` 在加载 BOM 详情前串行刷新三类工程证据。
- 任一刷新动作抛错时，`getBomById()` 不执行，用户点击 BOM 后详情无法打开。

## 影响
- BOM 详情是工程数据、齐套检查、排产约束与 OTD 证据链的用户关键路径。
- 辅助工程证据刷新失败不应让主详情选择路径不可用。

## 修复
- 新增 `refreshEngineeringEvidenceForSelection()`，逐项捕获替代料确认、ECN 影响分析、BOM 齐套包刷新失败。
- 失败时聚合为 `BOM 工程证据刷新失败...已继续加载 BOM 详情`。
- `selectBom()` 继续执行 `getBomById()`，保留原有详情 API fallback 行为。

## 状态
- 已修复并验证通过。
