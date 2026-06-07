# Audit Replay 知识治理失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进审计决策回放，不扩展新功能。
- 本片覆盖知识治理审计读取失败：后端失败且本地没有知识治理复核记录时必须 fail-loud，同时保留基础回放卡片。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增 `知识治理接口失败时真实浏览器保留基础回放并告警`。
  - 拦截 `**/api/v1/scheduling/knowledge-governance-reviews**` 为 503。
  - 稳定拦截 POC 证据和业务落库审计旁路接口，避免旁路 fallback 干扰目标断言。
  - 清空本地知识治理复核记录，断言页面保留基础回放卡片。
  - 断言 `.replay-sync-alert` 显示 `知识治理加载失败` 和 `knowledge governance unavailable from chromium`。
  - 断言知识治理路由命中数大于 0，避免测试只走静态演示数据。
- `src/frontend/src/api/knowledgeGovernanceEvidence.ts`
  - `queryKnowledgeGovernanceReviews()` 不再吞掉后端错误。
- `src/frontend/src/utils/knowledge-governance-sync.ts`
  - 有本地知识治理复核记录时继续兜底。
  - 后端失败且本地无记录时抛出错误，让审计回放面板 fail-loud。
- `src/frontend/tests/unit/knowledge-governance-sync.test.ts`
  - 补充后端失败且有本地复核记录时兜底。
  - 补充后端失败且无本地复核记录时抛错。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "知识治理接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`
  - Nuxt production build passed。
  - Chromium 16/16 passed。
- `npm.cmd run test:unit -- tests/unit/knowledge-governance-sync.test.ts`
  - Vitest 6/6 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub Actions run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
