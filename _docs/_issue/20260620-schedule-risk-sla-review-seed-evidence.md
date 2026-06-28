# 2026-06-20 Issue - Schedule Risk SLA latest 为空

## 现象
- `/scheduling/scheduling` 首屏仍请求 `/api/v1/scheduling/risk-sla-review/latest` 并得到 404。
- Risk SLA 是排产、风险队列、报表与聊天上下文共用证据，不应长期依赖本地空状态。

## 根因
- 当前 Docker PostgreSQL 与集成 seed 没有 `RiskSlaReview` 类型的 `agent_evidence_links`。

## 处理
- 为当前演示排产计划补 Risk SLA 晨会复核包 evidence link。
- 增加集成测试，确认 latest 可反序列化为完整 Risk SLA review。

## 状态
- 当前 Docker API 直接读取 Risk SLA latest 已返回 200。

