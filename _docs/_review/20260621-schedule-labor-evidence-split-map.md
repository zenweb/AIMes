# Review - Schedule Labor Evidence Split Map

## Scope
- Documentation and release-candidate boundary analysis only.
- No product behavior changed.

## Findings
- The labor retry candidate is still not safe to stage or push as-is.
- The largest risk is `src/frontend/tests/e2e/scheduling.spec.ts`, where the labor retry tests are mixed with large multi-objective and real dhtmlx suites.
- `src/frontend/scripts/e2e.mjs` is small but still mixed: labor retry live mode and real dhtmlx live mode share the runner routing hunk.

## Validation
- Boundary guard reports regenerated and still fail for the expected reasons.
- Split map identifies keep/exclude locations and explicit stop conditions for the next staging attempt.

## Residual Risk
- The split map is token-location evidence, not a semantic patch. The staged diff still requires human review before push.
