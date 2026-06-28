# Review - Employee live backend offline-demo recovery - 2026-06-22

## Result

PASS for the narrow employee live-backend entry issue.

## Findings

- No backend outage was found. `GET /health` on port `5003` returned `200 Healthy`.
- The observed `Offline demo mode skipped backend request` message is consistent with stale browser demo state, not a failed `/api/v1/employee` backend response.
- A clean browser storage login with `admin / admin123` produced a real JWT and a successful `GET /api/v1/employee?page=1&pageSize=20`.
- The employee fallback state now gives operators a bilingual visible recovery affordance and links directly to `/scheduling/employee?offlineDemo=0`.
- Browser audit found that direct employee recovery lost the post-login return target; the link now targets `/scheduling/login?offlineDemo=0&redirect=/employee?offlineDemo=0`.
- Refreshed real browser verification proves the operator flow: offline employee fallback -> recovery link -> live login -> live employee page with `aimes_offline_demo=false`, real JWT, `EMP-001` / `张三`, and no fallback error text.
- Focused Playwright coverage now locks the recovery affordance in the staged index: visible bilingual prompt, exact link target, click-through to online login, and `aimes_offline_demo=false`.
- Follow-up real browser recheck of `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0` found `4173` and `5003` listening, `aimes_offline_demo=false`, no recovery prompt, no `Offline demo mode skipped backend request`, and visible backend employees `EMP-001` / `EMP-002` / `EMP-003`.
- Second follow-up found a stale `4173` node preview process serving old Nuxt resource hashes. Restarting preview from `src/frontend` after `npm run build` restored the current bundle and the live employee page.

## Risks

- Existing dirty worktree contains broader employee E2E and scheduling changes. Do not stage those files wholesale for this narrow recovery package.
- A user browser that still has stale `demo-token-*` values can use the visible "切换在线后端" recovery link; manual `localStorage.clear()` remains a fallback if the browser storage is corrupted.
- If a user enters via `offlineDemo=1`, the local demo fallback is intentional; the online proof requires either the recovery link or an explicit `offlineDemo=0` entry URL.
- If `4173` is already occupied by an old `node ./scripts/preview.mjs`, rebuilds alone are insufficient; stop and restart the preview process so it loads the current `.output`.
- E2E evidence is focused on employee offline-demo entry/recovery only; it is not a full frontend E2E pass.

## Evidence

- `_docs/_reports/employee-live-backend-offline-demo-recovery-20260622.md`
