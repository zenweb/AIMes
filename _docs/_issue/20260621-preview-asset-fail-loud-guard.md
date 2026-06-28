# Issue - Preview Asset Fail-Loud Guard

## Problem
- A stale or partial `.output` can serve HTML that references missing `_nuxt` chunks.
- In the browser this can look like a feature regression, blank page, or old error text, which wastes debugging time.

## Root Cause
- `scripts/preview.mjs` did not validate client asset integrity before starting Nitro.

## Resolution
- Added a startup check that imports `.output/server/chunks/build/client.precomputed.mjs`.
- The check verifies every module `file` listed by the manifest exists under `.output/public/_nuxt`.
- Missing files now stop preview startup with an explicit remediation message.
- Extracted the check into a testable module and kept `preview.mjs` as the startup wrapper.

## Verification
- `npm run test:unit -- tests/unit/preview-asset-check.test.ts`: 2/2 passed.
- Temporarily removing the employee chunk produced `Preview build asset check failed: 1 referenced _nuxt assets are missing (D91iPFlu.js)`.
- The removed file was restored immediately after the probe.

## 2026-06-21 Refresh
- Gap found: Nuxt also records CSS/font/preload/prefetch assets outside the top-level `modules` map.
- Resolution: recursive manifest scanning now checks every nested `{ file: "..." }` reference.
- Verification: preview asset unit 3/3 passed, `npm run build` passed, and temporary `PORT=4174 node ./scripts/preview.mjs` reached listen.
