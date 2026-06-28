# 2026-06-20 Plan: Agent 配置审批后端残缺记录兜底

## 目标

后端优先读取 Agent 配置审批时，残缺后端记录不能覆盖默认/本地完整审计证据，尤其不能把质量推荐实验扩大门禁误判为 approved。

## 成功标准

- 后端只返回 `id/status/decidedAt/submittedAt` 时，质量实验扩大门禁保持 `reviewing`。
- `readQualityExperimentExpansionGatePolicy()` 保持 `effective: false` 与 `recheckPassRateMin: 100`。
- 完整后端审批记录仍可按时间戳作为更新证据。
- 本地 partial override 仍可工作。

## 执行步骤

1. 新增 RED：残缺后端 approved 不得放宽质量门禁。
2. 新增后端完整记录 guard。
3. 质量门禁记录增加 policy metrics/control summary 完整性要求。
4. 跑目标、相邻、lint、diff check。
5. 补 changelog/review/issue/todo/plan。

## 当前状态

已完成。
