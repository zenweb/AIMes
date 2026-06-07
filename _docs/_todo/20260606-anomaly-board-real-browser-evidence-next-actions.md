# AnomalyBoard 真实浏览器证据下一步

日期：2026-06-06

## 下一步

- 停止在 `ChatPanel`、`AuditDecisionReplayPanel`、`AnomalyBoard` 的已通过真实浏览器路径上反复刷新。
- 下一片按覆盖率杠杆选择仍缺证据的用户必经组件。
- 若继续 A 轨质量打磨，先跑 `test:unit:coverage` 读取当前覆盖率，再选择最低覆盖且用户关键的组件。

## B 轨仍需单独追踪

- Hosted CI run URL/run id/job summary。
- PostgreSQL/staging 演练证据。
- Attack Chain A/B/C 人工验证人与 `VerifiedAt`。
- 授权安全签字。
- 首次灰度和 14 天 P0/P1=0 观察结果。
