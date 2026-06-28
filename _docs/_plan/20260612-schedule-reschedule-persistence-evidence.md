# 2026-06-12 Plan：排产拖拽保存后端持久化证据

## 目标

把“真实 dhtmlx 拖拽保存”从前端浏览器证据延伸到后端持久化证据，证明 reschedule API 成功后数据库和 GET 读模型都保存了新的时间窗口。

## 执行

1. 定位 `PATCH /plans/{planId}/items/{itemId}` 的 Minimal API 实现。
2. 读取现有 `SchedulingControllerTests` 和测试工厂，避免依赖 AI optimize。
3. 新增集成测试：
   - seed 一个可编辑计划和排产项。
   - PATCH 新的开始/结束时间。
   - 用新 scope 查数据库。
   - 用 GET plan 查读模型。
4. 跑新增测试与整个 `SchedulingControllerTests`。

## 停止条件

- 新增测试通过。
- `SchedulingControllerTests` 全类通过。
- 不需要生产代码变更时，不强行改业务代码。

## 结果

停止条件已满足。大目标继续 active。
