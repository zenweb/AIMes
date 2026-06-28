# Current Execution Status - 2026-06-22

## Active Goal

- Continue CC plan implementation and audit until issues are resolved.
- Do not claim strict v1.0.0 complete; the broader release gate remains open unless separately re-scoped and proven.

## Current Staged Index State

Status:
- The staged index is no longer a single narrow `schedule-labor-evidence-retry` package.
- It currently contains a multi-slice frontend/review bundle plus many 20260622 documents.
- This bundle is testable, but it should be human-reviewed as a bundle or split before commit.

Staged source areas include:
- Employee live backend / offline demo recovery.
- Offline demo HTTP/auth/router recovery support.
- Schedule formal writeback state.
- Schedule guidance links/help.
- Schedule startup engineering fail-loud.
- Schedule drag writeback fail-loud.
- Schedule feedback restore.
- Schedule Assistant recovery handoff fail-loud.
- Schedule Agent Workbench formal writeback display.
- Scheduling E2E support updates.

Staged documentation includes:
- 20260622 changelog/reports/review/todo entries for the slices above.
- Index/readiness/package-boundary reports.

## Latest Validation

Commands run on 2026-06-22:
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts tests/unit/offline-demo-mode.test.ts`
  - Result: 6 files passed, 109 tests passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts`
  - Result after Schedule current-worktree audit fixes: 2 files passed, 38 tests passed.
  - Result after Schedule post-closure append/fail-loud hardening: 2 files passed, 41 tests passed.
  - Result after Schedule feedback-note classification: 2 files passed, 42 tests passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --grep "急单 Agent 采纳后区分反馈与正式排产回写|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`
  - Result after Schedule current-worktree audit fixes: 4 tests passed.
- `git diff --cached --check`
  - Result: pass.
- `git diff --check`
  - Result: pass for the full current worktree; Git emitted LF-to-CRLF normalization warnings only, with no whitespace/conflict-marker errors.
- `npx eslint scripts/e2e.mjs src/api/http.ts src/components/employee/EmployeeBoard.vue src/components/schedule/ScheduleAgentWorkbenchPanel.vue src/components/schedule/ScheduleBoard.vue src/router/index.ts src/stores/auth.ts src/utils/offline-demo-mode.ts tests/e2e/employee.spec.ts tests/e2e/scheduling.spec.ts tests/unit/employee-board.test.ts tests/unit/http-refresh.test.ts tests/unit/nuxt-auth-middleware.test.ts tests/unit/router-auth.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts --max-warnings 0`
  - Result: pass for the staged frontend source/test files covered by the current ESLint config.
  - Boundary: `middleware/auth.global.ts` is ignored when passed directly to ESLint because the current config has no matching rule for that path; it remains covered by `nuxt-auth-middleware.test.ts`.
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/employee-board.test.ts tests/unit/auth.store.test.ts tests/unit/router-auth.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/http-refresh.test.ts tests/unit/nuxt-auth-middleware.test.ts`
  - Result: 8 files passed, 150 tests passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts --grep "急单 Agent 采纳后区分反馈与正式排产回写|调度员 Agent 工作台通过后端 API|调度员 Agent 工作台后端 403|调度员 Agent 工作台 API 不可用"`
  - Result: 4 Chromium tests passed.
- `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"`
  - Result: 1 Chromium test passed.
- `npm run test:unit`
  - Result: 118 files passed, 1253 tests passed.
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --configuration Debug`
  - Result: 452 tests passed.
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --configuration Debug`
  - Result: 129 tests passed.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Debug`
  - Result: 216 tests passed.
- `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj --no-restore --configuration Debug`
  - Result: 3 tests passed.
- `dotnet build src/backend/AIMes.slnx --no-restore --configuration Debug`
  - Result: succeeded with 0 warnings and 0 errors.
- `npm run test:unit -- tests/unit/admin-board.test.ts`
  - Result after Admin route-link hardening: 1 file passed, 32 tests passed.
- `npm run test:e2e -- tests/e2e/admin.spec.ts`
  - Result after Admin route-link hardening: 33 Chromium tests passed.
- `npm run test:e2e`
  - Result: timed out after the 10-minute guard before producing a full-suite pass/fail summary.
  - Cleanup: confirmed and stopped the remaining test runner / preview / Playwright worker / temporary Playwright Chrome process chain; ordinary user browsers were not targeted.
  - Evidence from artifacts: the first red cluster was in `tests/e2e/audit.spec.ts`, initially caused by auth/backend mock setup making protected audit routes bounce between `/scheduling/login` and `/scheduling/dashboard`.
- `npm run test:unit -- tests/unit/poc-review-signoff-sync.test.ts tests/unit/audit-decision-replay-panel.test.ts`
  - Result after Audit fail-loud/auth mock hardening: 2 files passed, 66 tests passed.
- `npm run test:e2e -- tests/e2e/audit.spec.ts`
  - Result after Audit fail-loud/auth mock hardening: 36 Chromium tests passed.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts`
  - Result after live-mock page reuse fix: 9 Chromium tests passed.
- `npm run test:unit -- tests/unit/barcode-print-board.test.ts`
  - Result after Barcode Scanner context-link hardening: 1 file passed, 10 tests passed.
- `npm run test:e2e -- tests/e2e/barcode.spec.ts`
  - Result after offline-demo entry/query preservation fix: 2 Chromium tests passed.

Staged-index note:
- Validation was run against a temporary staged-index view and the worktree files were restored from backup afterward.
- A staged `ScheduleBoard.vue` missing helper was fixed in the index: `formatScheduleSaveDate(...)`.
- Staged audit found that schedule guidance links used root paths (`/audit-logs`, `/report`) and would leave the `/scheduling` entry. The index now generates `/scheduling/audit-logs` and `/scheduling/report`, with the focused unit assertion updated.
- Current-worktree recheck found the same guidance-link regression had reappeared outside the staged index. The working file now uses `auditTrailLink` / `deliveryReportLink` from `scheduleRoutePath(...)` again.
- Current-worktree recheck found drag writeback success could throw `formatScheduleSaveDate is not defined`, hiding the successful formal-save status. The working file now restores `formatScheduleSaveDate(...)`; the focused unit test covers the visible `已保存到正式排产计划` status.
- Current-worktree post-closure audit found batch objective feedback still overwrote prior sync evidence. It now appends progress/success/failure notes, preserving earlier adoption failures.
- Current-worktree post-closure audit found outsourcing schedule release could lose its visible archive trace when the follow-up risk refresh fell back. Release trace stays in `.sync-note`, while risk fallback remains in `.risk-event-sync-note`.
- Current-worktree post-closure audit found Assistant recovery closure could be interrupted by secondary engineering/risk refresh failures. These refreshes are now fail-loud and append notes while preserving the closed recovery suggestion.
- Current-worktree feedback-note classification found `handleScheduleDecision(...)` still replaced startup audit warnings. Post-decision progress/success/failure messages now append, while `restoreLatestFeedbackSnapshot(...)` remains the only intentional startup-note replacement path.
- Staged audit found that Assistant recovery handoff closure could still be interrupted by a later Assistant engineering package refresh failure. The index now keeps the closed recovery suggestion visible and appends a fail-loud sync note when that secondary refresh fails.
- Staged audit found that outsourcing schedule release success could remain visually buried behind the generic adoption feedback note. The index now appends an explicit release archive trace after successful release and keeps the release confirmation suggestion visible.
- Staged audit found that batch objective feedback could overwrite existing business sync notes. The index now appends batch feedback progress/success/failure messages so prior business evidence remains visible.
- Staged audit found that the base schedule feedback sync path could overwrite an existing startup/business sync note. The index now appends feedback progress/success/failure messages so prior evidence remains visible.
- Staged audit found that outsourcing schedule release failure could overwrite existing adoption/business sync notes. The index now appends the release failure message so prior evidence remains visible.

Admin real-browser closure:
- Root cause: Admin E2E wrote demo-token state but did not enter protected routes with an explicit `offlineDemo=1` query; the auth guard correctly cleared demo tokens when protected routes loaded without the explicit demo entry marker.
- Secondary cause: Admin governance navigation used protected routes without preserving the demo query, so follow-up navigation from Admin to audit/employee/production/schedule/report boards could clear the session.
- Fix: Admin E2E now enters protected Admin scenarios through `admin?offlineDemo=1`, protected URL assertions accept preserved queries, and AdminBoard uses `openRelatedRoute(...)` to preserve explicit offline-demo state.
- Fail-loud coverage: startup system-config and notification-config failures are covered by a live-mock Admin E2E branch using `offlineDemo=0`, a backend token, and API 503 responses.
- Link audit follow-up: Admin top guidance links now use `/scheduling/audit-logs` and `/scheduling/knowledge/documents` instead of root-relative links, keeping users inside the app entry.
- Evidence: focused Admin unit validation now passes 32 tests; the full Admin E2E run after route-link hardening passed 33 Chromium tests.

Audit real-browser closure:
- Root cause: Audit E2E used a non-demo mock token without a stable mocked backend surface. When unmocked API calls returned unauthenticated responses, the HTTP interceptor cleared auth and the page bounced between `/scheduling/login` and `/scheduling/dashboard` before `.audit-board` rendered.
- Fix: Audit E2E now seeds a refresh token and default `/api/v1/**` responses in `beforeEach`, while individual fail-loud tests still override their targeted backend routes.
- Assertion hardening: Audit list fallback checks now target the exact table cell `Production`, avoiding strict-mode collisions with contextual navigation links.
- Product hardening: `readPocReviewSignoffRecordBackendFirst(...)` now supports `{ failLoud: true }`; Audit replay uses that mode so malformed backend POC signoff payloads produce visible replay alerts instead of silently falling back to local evidence.
- Evidence: focused Audit unit validation passed 66 tests and focused Audit E2E passed 36 Chromium tests.

Anomaly real-browser closure:
- Root cause: one live-mock failure scenario used `context.newPage()` while the suite-level offline-demo init script also applied to protected entries, causing the new page to race between live mock and offline demo session setup.
- Fix: the scenario now reuses the current Playwright `page` and seeds the live mock session on that page before navigating with `offlineDemo=0`.
- Evidence: focused Anomaly E2E passed 9 Chromium tests.

Barcode real-browser closure:
- Root cause: Barcode E2E seeded a demo-token-like route context without a refresh token or explicit offline-demo query; after Barcode loaded, the `去扫描验证` link targeted `/scanner` without `offlineDemo=1`, so auth guards correctly cleared demo auth and sent the browser to `/scheduling/login`.
- Fix: Barcode E2E now seeds explicit offline-demo auth state and enters through `barcode?offlineDemo=1`; `BarcodePrintBoard` preserves `offlineDemo=1` on the Scanner contextual link when the current page or stored session is offline demo.
- Evidence: focused Barcode unit validation passed 10 tests and focused Barcode E2E passed 2 Chromium tests.

Chat real-browser closure:
- Root cause: the Chat empty-state E2E route only mocked `knowledge/chat-history`, while the suite default `/api/v1/**` route returned 503 for `/llm/status`; `ChatPanel` correctly added an LLM status alert, so the empty-state condition `!messages.length && !loading` no longer held.
- Fix: the empty-state scenario now mocks `/api/v1/llm/status` with a reachable model payload and returns the full chat-history shape `{ sessionId, messages, totalCount }` with an empty message list.
- Evidence: `npm run test:e2e -- tests/e2e/chat.spec.ts --grep "空状态显示|生产完工后解释"` passed 2 Chromium tests, and the full Chat E2E run `npm run test:e2e -- tests/e2e/chat.spec.ts` passed 37 Chromium tests.

Dashboard real-browser closure:
- Root cause: Dashboard E2E failure-state scenarios seeded mock tokens without a complete default auth/API surface, so unmocked backend requests could trigger auth refresh churn or unrelated fallback behavior before the asserted dashboard state stabilized.
- Fix: Dashboard E2E now seeds a refresh token, mocks `/api/v1/auth/refresh`, provides a deterministic `/api/v1/dashboard` payload, returns `null` for optional `/latest` evidence calls, and keeps `/api/v1/scheduling/otd-evidence` at 404 by default so local OTD evidence fallback remains testable.
- Cross-module evidence hardening: the 5-minute demo rehearsal test now asserts the local `demo-rehearsal-20260521` record, then exposes that exact record through the mocked OTD evidence endpoint before checking Report evidence visibility with longer targeted waits.
- Evidence: `npm run test:e2e -- tests/e2e/dashboard.spec.ts --grep "后端生产概览数据读取失败"` passed 1 Chromium test, `npm run test:e2e -- tests/e2e/dashboard.spec.ts --grep "5 分钟 Demo 彩排确认"` passed 1 Chromium test, and the full Dashboard E2E run `npm run test:e2e -- tests/e2e/dashboard.spec.ts` passed 13 Chromium tests.

Demo asset capture real-browser closure:
- Root cause: the asset capture suite used a demo-like token without explicit offline-demo route entry and waited on `networkidle`, making screenshot capture vulnerable to auth guard cleanup and background request timing.
- Fix: the suite now seeds explicit offline-demo auth state, enters each protected page with `?offlineDemo=1`, raises the spec timeout to 60 seconds, and waits for concrete page landmarks instead of `networkidle`.
- Evidence: `npm run test:e2e -- tests/e2e/demo-asset-capture.spec.ts` passed 5 Chromium tests and regenerated the five demo screenshot paths under `_docs/_marketing/demo-screenshots/`.

Engineering data real-browser closure:
- Root cause: the suite seeded an access token without a matching refresh token/default backend mock surface. Protected engineering routes could therefore churn through auth refresh or receive unrelated default responses before BOM, scheduling, OTD, and Report evidence stabilized.
- Secondary cause: the default Report dashboard mock shape could prevent the Report evidence fallback from rendering the cross-module OTD assertion.
- Fix: Engineering data E2E now seeds `aimes_refresh_token`, mocks `/api/v1/auth/refresh`, returns `null` for optional `/latest` reads, lets BOM/routing/scheduling/report routes exercise their intended fallback behavior, and keeps fail-loud API 503 messages visible where that is the product contract.
- Evidence: the targeted cross-module grep for `BOM 替代料工程确认释放排产约束并进入 OTD 审计|AI 排产同步工程约束到 OTD 证据链与审计回放` passed 2 Chromium tests, and full `npm run test:e2e -- tests/e2e/engineering-data.spec.ts` passed 16 Chromium tests.

Employee live entry evidence:
- `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`
- Login `admin/admin123` returned `POST /api/v1/auth/login` 200.
- Employee loading issued `GET /api/v1/employee?page=1&pageSize=20` and received 200 JSON.
- Browser storage after login: `aimes_offline_demo=false`, JWT token present.
- 2026-06-22 recheck: direct backend probe on `http://127.0.0.1:5003/api/v1/employee` returned 3 employees after `admin/admin123` login; real browser then landed on `/scheduling/employee?offlineDemo=0`, showed `EMP-001` / `张三`, and did not show `员工列表加载失败` or `Offline demo mode skipped backend request`.
- Employee recovery link closure:
  - Offline employee fallback now shows a bilingual in-page recovery link: `当前展示本地示例数据` / `Current view is using local demo data` / `切换在线后端`.
  - Link target is `/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`, preserving the employee return target after live login.
  - Real browser closure confirmed: offline employee fallback -> recovery link -> live login -> `/scheduling/employee?offlineDemo=0`, real JWT, `EMP-001` / `张三`, no recovery prompt, no employee load failure, no offline-demo skip text.
  - Staged-index E2E closure confirmed by temporarily replacing the worktree file with `git show :src/frontend/tests/e2e/employee.spec.ts` and running `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "离线员工页提供切换在线后端入口"`: 1 test passed.
- If the UI shows `Offline demo mode skipped backend request: /api/v1/employee`, the current evidence points to stale browser state or an explicit `offlineDemo=1` URL, not missing Docker/backend software.
- Latest recheck after the repeated report used the live login URL `http://127.0.0.1:4173/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`; `admin/admin123` produced `POST /api/v1/auth/login` 200 and `GET /api/v1/employee?page=1&pageSize=20` 200 twice, with `aimes_offline_demo=false`, a real JWT, `EMP-001 张三` visible, and no offline skip/local demo prompt.

Employee E2E expansion candidate:
- The unstaged `src/frontend/tests/e2e/employee.spec.ts` expansion remains separate from the staged recovery-link hunk.
- Boundary audit correction: this unstaged candidate is broader than personnel capability and includes pagination live mock, offline-demo entry expansion, a live-backend-gated scenario, and personnel capability coverage.
- Fresh unit evidence: `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/skill-matrix-panel.test.ts` passed 29 tests.
- Fresh lint evidence: `npx eslint tests/e2e/employee.spec.ts --max-warnings 0` passed.
- Fresh focused E2E evidence: `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "Employee 人员能力约束"` passed 15 Chromium tests.
- Fresh full employee E2E evidence: `npm run test:e2e -- tests/e2e/employee.spec.ts` passed 19 Chromium tests with 1 explicitly live-backend-gated test skipped.
- This is enough to keep the employee E2E expansion candidate reviewable as its own package, but not enough to claim full CC plan completion.

## Worktree Boundary

Current risk:
- Several files remain `MM`, especially `ScheduleBoard.vue`, `schedule-board.test.ts`, `schedule-agent-workbench-panel.test.ts`, and `tests/e2e/employee.spec.ts`.
- The unstaged worktree still contains broader candidate changes and must not be broad-staged.
- For `tests/e2e/employee.spec.ts`, the staged index intentionally contains only the minimal employee recovery-link E2E hunk. The worktree still contains broader personnel capability E2E candidates that are not part of the reviewed employee recovery slice.
- `ScheduleBoard.vue` and `schedule-board.test.ts` now contain intentional current-worktree fixes for the Schedule guidance-link and drag-save-status regressions; stage these hunks deliberately if keeping the Schedule slice together.
- `ScheduleBoard.vue` and `schedule-board.test.ts` also contain intentional current-worktree post-closure hardening for batch objective feedback, outsourcing release, and Assistant recovery closure.
- Schedule feedback-note classification is now covered by a focused unit assertion that keeps `后端最新采纳反馈不可审计` visible after a successful schedule feedback sync.

Do:
- Review the staged bundle directly with `git diff --cached`.
- If a smaller commit is desired, split the index by intentional package boundaries before adding new source changes.
- Use exact focused validation commands when claiming a slice is pass.

Do not:
- Treat unstaged candidate changes as reviewed.
- Treat this focused validation as full frontend health.
- Treat the latest full E2E attempt as green; it timed out before full-suite completion, although the Admin, Audit, Anomaly, Barcode, Chat, Dashboard, Demo asset capture, Employee, Engineering data, and Scheduling focused clusters now have targeted green evidence.
- Treat this report as v1.0.0 completion.

## Next Safe Action

Preferred next action:
- Human review or explicit split of the current staged multi-slice bundle.

If continuing implementation before commit:
- Keep new work in docs, reports, or a clean temporary worktree until the staged bundle is resolved.
- Continue the full frontend E2E closure from the next failing spec after Chat; do not rework Admin/Audit/Anomaly/Barcode/Chat unless new evidence regresses them.
- The next source slice should start from a clean index boundary where practical, not by broad-staging the current mixed staged bundle.
