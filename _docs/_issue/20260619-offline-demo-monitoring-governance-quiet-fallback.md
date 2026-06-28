# 2026-06-19 Issue: Offline Demo Monitoring Governance Quiet Fallback

## Problem
Real browser verification showed `/scheduling/monitoring?offlineDemo=1` could display startup governance failure copy containing:

`Offline demo mode skipped backend request: /api/v1/scheduling/poc-hypercare-acceptance/latest`

## Root Cause
The monitoring board startup catch block treated offline demo transport skips like real backend failures and copied the technical skip message into the user-facing situation sync note.

## Resolution
- Imported `isOfflineDemoError`.
- During startup governance reads, `OfflineDemoApiError` now skips the failure copy but still allows the page to continue into demo monitoring data initialization.
- Ordinary backend failures still render the existing fail-loud initialization message.

## Status
Resolved for monitoring startup governance reads.
