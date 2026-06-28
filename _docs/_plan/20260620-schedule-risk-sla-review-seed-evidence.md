# 2026-06-20 Plan - Schedule 风险 SLA review seed 证据

## 成功标准
- `/api/v1/scheduling/risk-sla-review/latest` 返回 200。
- 返回记录必须包含会议、审计、trace、风险项和责任动作。
- 排产页真实浏览器不再出现 Risk SLA latest 404。

## 执行结果
- 已定位 Risk SLA 存储在 `agent_evidence_links`。
- 已补集成 seed、SQL 恢复脚本和集成测试。
- 已通过排产相关集成测试。

## 后续验证
- 跑前端 build。
- 真实浏览器复验 `/scheduling/scheduling`。

