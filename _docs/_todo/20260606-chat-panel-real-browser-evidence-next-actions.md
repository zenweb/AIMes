# ChatPanel 真实浏览器证据下一步

日期：2026-06-06

## 下一步

- 按覆盖率杠杆选择下一组件，优先候选：`AuditDecisionReplayPanel.vue`、`AnomalyBoard.vue` 或其他低覆盖且用户必经组件。
- 对下一组件先做静态失败路径扫描，再按 TDD 只修一个明确用户触发缺口。
- 修复后跑对应单测、全量 `test:unit:coverage` 和相关 Playwright Chromium e2e。

## B 轨仍需单独追踪

- Hosted CI：需要 GitHub run URL/run id/job summary。
- PostgreSQL/staging：需要可复现演练证据。
- Attack Chain A/B/C：需要人工验证人与 `VerifiedAt`。
- Security signoff：需要授权人签字。
- Gray observation：需要首次灰度和 14 天 P0/P1=0 观察结果。
