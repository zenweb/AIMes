# 2026-06-11 Sprint 0 前端 e2e 证据链回退修复

## 变更

- 修复审计回放页在后端助手动作审计读取失败时只报错、不回退本地离线证据的问题。
- 修复实时监控页在 POC Hypercare 后端读取失败时只报错、不展示刚生成本地验收包的问题。
- 对齐质量返工 e2e 按钮定位到稳定可访问名称 `生成返工排产事件`，避免测试继续依赖旧动态全名。
- 同步前端 unit mock 与断言契约，让默认 `npm run test:unit` 覆盖新增本地 fallback 读取导出与质量返工稳定按钮名。
- 保留 fail-loud 告警，不把后端/API 读取失败伪装成绿色。
- 按覆盖率杠杆选片补强 `AuditDecisionReplayPanel`，覆盖质量灰度决策的“审批通过后扩大推荐范围”回放分支，避免继续精修已高覆盖登录页。
- 按覆盖率杠杆继续补强 `AnomalyBoard`，覆盖现场事件中心确认质量异常分流后写入并展示下游处置 trace 的现有行为。
- Docker Desktop/Linux Engine 恢复后，复跑发布证据范围的真实 Chrome 前端 e2e，确认 `login/audit/monitoring/quality` 仍为 78 passed。

## 验证

- `npm run test:e2e -- --reporter=list --grep "...7 个原始红灯..."`：7 passed。
- `npm run test:e2e -- --reporter=list --grep "...13 个聚焦用例..."`：13 passed。
- `npm run test:e2e -- --reporter=list --grep "质量返工事件回写排产和 OTD 复盘"`：1 passed。
- `npm run test:e2e -- --reporter=list`：358 passed。
- `npx vitest run tests/unit/monitoring-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/quality-rework-impact-panel.test.ts`：29 passed。
- `npm run test:unit`：89 files / 596 tests passed，无 unhandled errors。
- `npm run lint`：PASS。
- `npm run test:unit -- audit-decision-replay-panel.test.ts -t "replays approved quality gray release expansion scope with decision evidence"`：1 passed。
- `npm run test:unit -- audit-decision-replay-panel.test.ts`：20 passed。
- `npm run test:unit:coverage -- audit-decision-replay-panel.test.ts`：20 passed；`AuditDecisionReplayPanel.vue` 单测切片分支覆盖率 20.49%，较旧 coverage summary 的 19.42% 有增量。
- `npm run test:unit:coverage`：89 files / 597 tests passed；用于刷新全量覆盖率选片基线。
- `npm run test:unit -- anomaly-board.test.ts -t "writes and displays a quality dispatch trace when users confirm event routing"`：1 passed。
- `npm run test:unit -- anomaly-board.test.ts`：7 passed。
- `npm run test:unit:coverage -- anomaly-board.test.ts`：7 passed；`AnomalyBoard.vue` 单测切片行覆盖率 75.83%，较全量基线中的 67.78% 有增量。
- `npm run test:e2e -- login.spec.ts audit.spec.ts monitoring.spec.ts quality.spec.ts`：生产构建 PASS，Chrome 78 passed；已写入 `_docs/_reports/frontend-real-browser-evidence-20260611.md` 的 Docker-restored rerun 小节。

## 发布闸门

- 本次只收敛 Sprint 0 前端真实浏览器回归。
- Attack Chain A/B/C 人工验证、安全签字、首次灰度与 14 天无 P0/P1 观察仍未由本次代码变更关闭。
