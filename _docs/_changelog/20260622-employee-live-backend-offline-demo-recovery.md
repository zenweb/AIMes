# 2026-06-22 - Employee live backend offline-demo recovery

## Changed

- Documented the root cause for employee list fallback caused by stale offline-demo browser storage.
- Captured live Chromium evidence proving `admin / admin123` reaches `GET /api/v1/employee?page=1&pageSize=20` successfully through the 4173 preview proxy.
- Added operator recovery steps for clearing stale demo sessions before re-entering the live employee page.
- Added an in-page bilingual recovery link on the employee offline-demo fallback state so operators can switch to `/scheduling/employee?offlineDemo=0` without opening developer tools.
- Updated the recovery link to use `/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`, preserving the employee page return target after live login.
- Added focused Playwright coverage for the employee offline-demo recovery link, including the bilingual prompt, link target, and `aimes_offline_demo=false` transition.

## Evidence

- `_docs/_reports/employee-live-backend-offline-demo-recovery-20260622.md`

## Notes

- Backend health on port `5003` was verified as `200 Healthy`.
- The page state after recovery had `aimes_offline_demo=false` and a real JWT prefix, not `demo-token-*`.
- Focused unit coverage now includes the visible live-backend recovery affordance.
- Refreshed real browser evidence confirms offline fallback -> recovery link -> live login -> live employee page works on the rebuilt 4173 preview.
- Focused E2E evidence passed: `Employee offline demo entry` 2 tests, plus staged-index `离线员工页提供切换在线后端入口` 1 test.
- User-reported skip text was rechecked in the real browser against `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`; the page held `aimes_offline_demo=false`, used a real JWT, showed backend employees, and did not show the offline-demo skip text.
- A later repeated fallback report was traced to a stale `4173` preview process serving old Nuxt hashes. Stopped the old process, rebuilt `src/frontend`, restarted preview against backend `5003`, and verified live login plus `GET /api/v1/employee` in the browser.
- Re-ran the live login path after the latest fallback report: `admin / admin123` returned `POST /api/v1/auth/login` 200 and two `GET /api/v1/employee?page=1&pageSize=20` 200 responses; browser storage stayed `aimes_offline_demo=false` and no offline-demo skip/local-demo prompt was visible.
