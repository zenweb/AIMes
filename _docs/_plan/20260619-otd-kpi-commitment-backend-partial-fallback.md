# 2026-06-19 Plan - OTD KPI Commitment Backend Partial Fallback

## Goal
Protect OTD KPI commitment backend-first readers from incomplete backend payloads so customer delivery promise evidence remains auditable.

## Steps
1. Scan remaining backend-first reader patterns and select a high-value unprotected reader.
2. Add failing tests for partial backend list and latest OTD KPI commitment payloads.
3. Confirm RED on the commitment sync test.
4. Add minimal backend payload guard checks.
5. Run focused sync/API tests, filtered report/schedule tests, lint, and diff check.
6. Record evidence and remaining release caveats.

## Stop Condition
- Partial backend commitment list entries cannot remove OTD lift, owner actions, commitment text, audit ID, trace ID, or summary.
- Partial backend latest commitment cannot replace the local complete customer promise package.
- Complete backend commitment records still take precedence over local fallback when present.
- Verification results and skipped filtered-test counts are documented.
