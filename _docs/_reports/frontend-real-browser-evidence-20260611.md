# Frontend real browser evidence

- GeneratedAt: 2026-06-11T09:37:00+08:00
- Scope: v1.0.0 user-critical frontend paths in real Chrome via Playwright.
- Command: `npm run test:e2e -- login.spec.ts audit.spec.ts monitoring.spec.ts quality.spec.ts`
- WorkingDirectory: `src/frontend`
- Browser project: `chromium`
- Browser channel: `chrome`
- Nuxt mode: production build + preview server from `src/frontend/playwright.config.ts`

## Result

- Build: PASS
- Tests: 78 passed
- Retries: no failing test reported
- Result: PASS

## Docker-restored rerun

- RerunAt: 2026-06-11T12:47:10+08:00
- Trigger: Docker Desktop/Linux Engine restored; rechecked that frontend release evidence still passes after environment recovery.
- Command: `npm run test:e2e -- login.spec.ts audit.spec.ts monitoring.spec.ts quality.spec.ts`
- WorkingDirectory: `src/frontend`
- Build: PASS
- Tests: 78 passed
- Browser project: `chromium`
- Browser channel: `chrome`
- Result: PASS
- Boundary: rerun confirms the selected production-preview frontend paths still pass in real Chrome; it does not replace Attack Chain A/B/C manual verification, security signoff, or gray observation.

## Network-confirmed real Chrome rerun

- RerunAt: 2026-06-11T21:21:18+08:00
- Trigger: Docker Desktop/Linux Engine and network were confirmed healthy; rechecked the release-critical frontend browser evidence instead of continuing unrelated micro-slices.
- Command: `npm run test:e2e -- login.spec.ts audit.spec.ts monitoring.spec.ts quality.spec.ts`
- WorkingDirectory: `src/frontend`
- Nuxt mode: production build + preview server from `src/frontend/playwright.config.ts`
- Build: PASS
- Tests: 78 passed
- Browser project: `chromium`
- Browser channel: `chrome`
- Result: PASS
- Boundary: this rerun proves the selected login/audit/monitoring/quality paths still pass in real Chrome after environment recovery. It does not replace Attack Chain A/B/C manual verification, security signoff, or the first gray release plus 14-day observation gate.

## Targeted Demo Main Chain Rerun

- RerunAt: 2026-06-11T22:35:39+08:00
- Trigger: Docker Desktop/Linux Engine and network were confirmed healthy; rechecked the user-critical 5-minute demo chain instead of repeating LoginPage micro-slices.
- Command: `npm run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"`
- WorkingDirectory: `src/frontend`
- Nuxt mode: production build + preview server from `src/frontend/playwright.config.ts`
- Build: PASS
- Tests: 1 passed
- Browser project: `chromium`
- Browser channel: `chrome`
- Result: PASS
- Assertion basis: real Chrome navigates Dashboard -> Scheduling -> Audit -> Report, verifies Dashboard OTD values from `latest-ab-report.json`, generates and adopts the mocked backend scheduling recommendation, opens audit replay for `TRACE-SCH-20260520-001`, and verifies the Report OTD review values and `5 分钟 Demo 路径` evidence.
- Boundary: this proves the current demo main chain in real Chrome after Docker/network recovery. It does not replace Attack Chain A/B/C manual verification, security signoff, or the first gray release plus 14-day observation gate.

## Targeted Schedule Rush Decision Depth Rerun

- RerunAt: 2026-06-11T23:40:00+08:00
- Trigger: core-feature boutique pass for the existing Scheduling rush-order decision path; rechecked the newly deepened multi-scenario decision package in real Chrome.
- Command: `AIMES_E2E_PORT=4181 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`
- WorkingDirectory: `src/frontend`
- Nuxt mode: production build + preview server from `src/frontend/playwright.config.ts`
- Build: PASS
- Tests: 1 passed
- Browser project: `chromium`
- Browser channel: `chrome`
- Result: PASS
- Assertion basis: real Chrome opens Scheduling, generates the `WO-RUSH-9001 客户插单` recommendation, verifies the `Agent 多方案决策包` includes `加班插入` / `强插当前窗口` / `换设备插入`, verifies the recommended scenario's `适用条件` and `取舍代价`, adopts the suggestion, verifies local feedback snapshot text, then opens Report and verifies OTD evidence chain retains the recommended and rejected scenario rationale.
- Visual evidence: `output/playwright/20260611-schedule-rush-decision/manifest.md`, `schedule-rush-scenario-package.png`, and `report-rush-otd-evidence.png`.
- Boundary: this proves the current Scheduling rush-order decision depth in real Chrome. It does not close Attack Chain A/B/C manual verification, security signoff, or the first gray release plus 14-day observation gate.

## Targeted ChatPanel XSS Rerun

- RerunAt: 2026-06-11T19:30:00+08:00
- Trigger: tighten Sprint 1 `ChatPanel markdown/XSS escapes unsafe HTML` from broad frontend/security evidence to direct real-browser evidence.
- Command: `npm run test:e2e -- chat.spec.ts -g "真实浏览器转义后端返回的 unsafe HTML 且只渲染受限 markdown"`
- WorkingDirectory: `src/frontend`
- Browser project: `chromium`
- Browser channel: `chrome`
- Build: PASS
- Tests: 1 passed
- Result: PASS
- Assertion basis: backend answer containing `<script>window.__aimesXss = true</script>` and `<img src=x onerror="window.__aimesXss = true">` renders as visible text; `**安全摘要**` renders as `strong`; Chrome DOM has zero rendered `script` and `img` nodes inside the assistant message; `window.__aimesXss` remains false.
- Boundary: this proves the current ChatPanel markdown/XSS path in real Chrome. It does not replace human Attack Chain A/B/C verification, security signoff, or gray observation.

## Targeted Anomaly Prefix Rerun

- RerunAt: 2026-06-11T19:40:00+08:00
- Trigger: tighten Sprint 1 `Anomaly frontend double-prefix bug fixed` from broad frontend-flow evidence to direct real-browser request-path evidence.
- Command: `npm run test:e2e -- anomaly.spec.ts -g "真实浏览器只请求单层 api/v1 anomaly 路径"`
- WorkingDirectory: `src/frontend`
- Browser project: `chromium`
- Browser channel: `chrome`
- Build: PASS
- Tests: 1 passed
- Result: PASS
- Assertion basis: the anomaly page explicitly disables offline demo mode, intercepts `/api/v1/anomaly`, renders mocked backend data `真实路径异常`, records at least one `/api/v1/anomaly` request, and asserts every recorded anomaly request excludes `/api/v1/api/v1/`.
- Boundary: this proves the current anomaly frontend request path in real Chrome. It does not replace human Attack Chain A/B/C verification, security signoff, or gray observation.

## Targeted Dashboard KPI Rerun

- RerunAt: 2026-06-11T19:51:35+08:00
- Trigger: tighten Sprint 0 `Dashboard KPI no Random.Shared` from broad endpoint random-scan evidence to direct deterministic backend-response evidence in real Chrome.
- Command: `npm run test:e2e -- dashboard.spec.ts -g "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标"`
- WorkingDirectory: `src/frontend`
- Browser project: `chromium`
- Browser channel: `chrome`
- Build: PASS
- Tests: 1 passed
- Result: PASS
- Assertion basis: the dashboard page explicitly disables offline demo mode, intercepts `/api/v1/dashboard`, returns KPI values `91.7%`, `88.4%`, `63.2%`, and `17`, records at least one `/api/v1/dashboard` request, and asserts Chrome renders those exact KPI card values instead of demo/random fallback metrics.
- Boundary: this proves the current dashboard frontend consumes deterministic backend KPI response values in real Chrome. It does not replace human Attack Chain A/B/C verification, security signoff, or gray observation.

## Targeted Quality Gray Monitor Rerun

- RerunAt: 2026-06-11T20:17:53+08:00
- Trigger: tighten Sprint 3 quality gray monitoring UI evidence from broad frontend coverage to a direct real-browser Agent governance monitor path.
- Command: `npm run test:e2e -- admin.spec.ts -g "R3 灰度发布进入 Agent 灰度监控指标"`
- WorkingDirectory: `src/frontend`
- Browser project: `chromium`
- Browser channel: `chrome`
- Build: PASS
- Tests: 1 passed
- Result: PASS
- Assertion basis: the Admin Agent governance page seeds a `gray_published` R3 quality retraining version, opens `质量推荐灰度监控`, renders `QK-TRAIN-20260521-R3 灰度监控`, and shows `推荐采纳率 100%`, `复验通过率 100%`, `负样本误召回 0 次`, `AUD-KG-QA-RETRAINING-R3-GRAY-PUBLISH-20260521-001`, and `TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-PUBLISHED`.
- Boundary: this proves the current quality gray monitor UI path in real Chrome. It does not close the first gray release plus 14-day observation gate, and does not replace human Attack Chain A/B/C verification, security signoff, or gray observation.

## Visual Evidence

- Screenshot manifest: `output/playwright/20260611-real-browser/manifest.md`
- Login page: `output/playwright/20260611-real-browser/login.png` / 370940 bytes / asserted `.login-card` and `智能制造执行系统`.
- Audit replay page: `output/playwright/20260611-real-browser/audit-logs.png` / 268209 bytes / asserted `.audit-board` and `建议、采纳、重排动作与配置审批可回放`.
- Monitoring page: `output/playwright/20260611-real-browser/monitoring.png` / 219304 bytes / asserted `.shopfloor-situation` and `现场态势图`.
- Quality page: `output/playwright/20260611-real-browser/quality.png` / 212327 bytes / asserted `.quality-board` and `质量闭环`.
- Capture method: one-shot Playwright/Chrome script against production preview on `http://127.0.0.1:4273/scheduling/`, reusing `.output-e2e-27040`, with screenshot size checks and no server process left running.

## Covered Paths

- Login/auth guard:
  - Login page rendering.
  - Empty form disabled state.
  - Backend login success routing.
  - First-login password-change routing.
  - Logged-in redirect.
  - Anonymous protected-route redirect.
- Audit replay:
  - AI recommendation, human acceptance, reschedule action, and config approval replay.
  - Backend audit list/detail failure fail-loud fallback.
  - Malformed audit payload fail-loud fallback.
  - OTD evidence replay.
  - POC, knowledge governance, quality gray decision, recommendation feedback, retraining, and rollback replay paths.
- Monitoring:
  - Shopfloor situation event stream.
  - OTD evidence write-back and audit replay.
  - Cross-module escalation across risk, scheduling, and audit.
  - SignalR startup failure fail-loud fallback.
- Quality:
  - Rework to scheduling and OTD review.
  - Root-cause analysis to CAPA and audit replay.
  - MRB disposition and closure.
  - Barcode rework quality gate release.
  - Quality knowledge sample, reuse draft, formal CAPA, effect feedback, retraining, recommendation feedback, and gray/rollback ranking.
  - Multiple storage/API failure paths that must fail loud and not forge evidence.

## Boundary

- This evidence proves the selected frontend paths execute in a real Chrome browser.
- This evidence does not replace backend staging probes, human Attack Chain A/B/C verification, security signoff, or gray observation.
- Playwright failure screenshots were not generated because all selected tests passed; the visual evidence above was captured as explicit release support evidence.
