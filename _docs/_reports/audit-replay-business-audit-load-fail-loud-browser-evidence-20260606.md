# Audit Replay 业务落库审计读取失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进审计决策回放，不扩展新功能。
- 本片只补真实 Chromium 证据：业务落库审计接口失败时，审计回放面板必须保留基础回放卡片并显示 fail-loud 告警。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/audit.spec.ts`
  - 新增 `业务落库审计接口失败时真实浏览器保留基础回放并告警`。
  - 关闭离线跳过后，拦截 `**/api/v1/audit-logs**` 为 503。
  - 断言 `AuditDecisionReplayPanel` 仍显示基础回放卡片。
  - 断言 `.replay-sync-alert` 显示 `业务落库审计加载失败` 和后端错误原因。
  - 断言路由命中数大于 0，避免测试只走静态演示数据。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts`
  - Nuxt production build passed。
  - Chromium 13/13 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub Actions run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
