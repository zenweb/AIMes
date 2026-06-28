# 2026-06-14 Plan - 排产反馈原因必填契约收紧

## 成功标准
- 请求 DTO 必须声明 `ReasonDetail` 非空且必填。
- latest snapshot DTO 必须声明 `ReasonDetail` 非空。
- 应用服务不能构造缺原因的 latest snapshot。
- 红测证明旧契约可空，绿测证明契约收紧。
- 后端排产目标测试和真实 Chromium 排产用例通过。
- 完成 diff、敏感信息和关键文本审计。

## 执行步骤
- 已用 `NullabilityInfoContext` 增加 DTO 契约红测。
- 已将 `AdoptionFeedbackRequest.ReasonDetail` 和 `AdoptionFeedbackSnapshotDto.ReasonDetail` 改为非空。
- 已在应用服务 latest 映射前增加空原因防御。
- 已完成后端目标测试和 Chromium 排产全量验证。

## 停止条件
- 本片完成审计后停止，不扩展到历史数据迁移或前端文案调整。
