# AuditDecisionReplayPanel 真实浏览器证据下一步

日期：2026-06-06

## 下一步

- 不继续在 `ChatPanel` 或 `AuditDecisionReplayPanel` 上空转。
- 继续按覆盖率杠杆挑选低覆盖且用户必经组件；优先重新评估 `AnomalyBoard.vue` 或其他覆盖率低于 70% 的核心业务页面。
- 下一组件必须先跑现有真实 Chromium e2e；若失败，按真实失败修；若通过，再只补一个明确缺失的用户触发 fail-loud 证据。

## B 轨仍需单独追踪

- Hosted CI run URL/run id/job summary。
- PostgreSQL/staging 演练证据。
- Attack Chain A/B/C 人工验证人与 `VerifiedAt`。
- 授权安全签字。
- 首次灰度和 14 天 P0/P1=0 观察结果。
