# Audit Replay 质量再训练版本失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进审计决策回放，不扩展新功能。
- 本片覆盖质量再训练版本审计读取失败：后端失败且本地没有质量再训练版本记录时必须 fail-loud，同时保留基础回放卡片。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增 `质量再训练版本接口失败时真实浏览器保留基础回放并告警`。
  - 拦截 `**/api/v1/scheduling/quality-knowledge-evidence**`，仅当 `evidenceType=QualityKnowledgeRetrainingVersion` 时返回 503。
  - 稳定拦截业务落库审计、POC 证据、知识治理和其他质量知识证据旁路接口，避免旁路 fallback 干扰目标断言。
  - 清空本地质量推荐反馈、再训练版本、灰度决策缓存，断言页面保留基础回放卡片。
  - 断言 `.replay-sync-alert` 显示 `质量再训练版本加载失败` 和 `quality retraining version unavailable from chromium`。
  - 断言质量再训练版本请求命中数大于 0，避免测试只走静态演示数据。
- `src/frontend/tests/unit/quality-knowledge-sample-sync.test.ts`
  - 补充后端质量再训练版本失败且无本地记录时抛错。

## 验证

- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "backend retraining versions fail"`
  - Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量再训练版本接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts`
  - Vitest 23/23 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`
  - Nuxt production build passed。
  - Chromium 19/19 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub Actions run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
