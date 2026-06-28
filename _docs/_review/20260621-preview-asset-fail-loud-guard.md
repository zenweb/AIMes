# Review - Preview Asset Fail-Loud Guard

## Scope
- Local preview startup only.
- No business component, API contract, or backend behavior changed.

## Findings
- Repeated employee-entry failures were caused by stale or incomplete preview output, not by employee-page business logic.
- The previous `preview.mjs` started Nitro without checking that the server manifest and public client chunks matched.
- The new guard fails loud when referenced chunks are missing, which turns a confusing browser/runtime symptom into an operator-visible startup error.
- The guard is covered as a focused unit test through `preview-asset-check.mjs`, avoiding server startup in unit tests.

## Validation
- Unit: `npm run test:unit -- tests/unit/preview-asset-check.test.ts` 2/2 passed.
- Missing asset probe failed with the expected explicit message.
- Existing active 4173 preview still serves the employee offline demo path successfully after the guard change.
- 2026-06-21 nested asset refresh: unit coverage now checks nested preload/style/font references; `preview-asset-check.test.ts` 3/3 passed, `npm run build` passed, and `PORT=4174 node ./scripts/preview.mjs` reached the listen step.

## Residual Risk
- The guard verifies referenced files exist; it does not prove semantic freshness versus source files. Build + restart + browser smoke remains required before giving a user-facing preview URL.
