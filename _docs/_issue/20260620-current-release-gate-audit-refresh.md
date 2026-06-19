# 2026-06-20 Issue - Current Release Gate Audit Refresh

## Symptom
- Previous aggregate release gate report still referenced older hosted CI evidence.

## Root Cause
- Recent CI repair commits advanced `V1` from the old evidence head, so hosted CI evidence needed to be refreshed to avoid relying on stale green runs.

## Fix
- Generated `_docs/_reports/hosted-ci-20260620-v1-c9ad93a-pass.md`.
- Generated `_docs/_reports/release-gate-audit-20260620-current-deferred-gray-pass.md`.

## Remaining Issue
- Strict v1.0.0 release PASS still requires the gray observation wall-clock gate unless owner continues to scope it out for follow-up work.
