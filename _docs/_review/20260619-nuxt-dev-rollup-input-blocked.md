# Review: Nuxt dev rollup input blocker

Date: 2026-06-19

## Findings

1. The original Rollup input startup failure is not safely cleared.
   - Severity: Medium
   - Evidence: adding a dev-only `server` input lets Vite build, but every tested dev HTTP endpoint then times out. That is not an acceptable fix.

2. `npm run dev` still cannot be treated as reliable browser-evidence infrastructure.
   - Severity: Medium
   - Reason: `/scheduling/`, `/scheduling/login`, `/_tailwind/`, and `/_nuxt/@vite/client` all timed out when the temporary input hook was present.

3. The issue is below product UI code.
   - Evidence: production preview serves `/scheduling/` and `/scheduling/login` with HTTP 200 on port `4173`; the Nuxt dev server path fails independently of page route selection.

4. Production path is not regressed by the audit.
   - Evidence: the temporary Nuxt dev config changes were reverted, then `npm run build`, `npm run lint`, and `npm run test:unit:coverage` passed.

## Residual risk

Hot-reload DX remains blocked. Release-style browser validation remains available through production build + preview.
