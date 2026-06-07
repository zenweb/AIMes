# AuditDecisionReplayPanel 回放详情区真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有审计回放关键路径。
- 本片覆盖点击“回放决策链”后，审计详情区必须作为命名区域向辅助技术暴露，并在选中回放链变化时以 polite 方式播报。
- 未改变审计回放数据映射、加载顺序、后端 fallback、配置审批或业务落库审计逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
  - `.replay-detail` 增加 `role="region"`。
  - `.replay-detail` 增加 `aria-live="polite"`。
  - `.replay-detail` 通过 `aria-labelledby="audit-replay-detail-title"` 关联详情标题。
- `src/frontend/tests/unit/audit-decision-replay-panel.test.ts`
  - 新增 RED/GREEN 单测，覆盖回放详情区命名 region/status 语义。
- `src/frontend/tests/e2e/audit.spec.ts`
  - `回放急单插入决策链` 真实 Chromium 用例改用 `getByRole('region', { name })` 验证详情区。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "selected replay chain as a named status region"`
  - 预期失败：`.replay-detail` 缺少 `role="region"`。
- GREEN：`npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "selected replay chain as a named status region"`
  - Vitest 1 file passed，目标用例通过。
- 真实浏览器：`npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "回放急单插入决策链"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
