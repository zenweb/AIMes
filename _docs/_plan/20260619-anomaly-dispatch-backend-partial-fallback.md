# 2026-06-19 Plan - Anomaly Dispatch Backend Partial Fallback

## Goal
Keep anomaly dispatch owner action, affected orders, delivery impact, and trace fields auditable when backend-first evidence reads receive partial payloads.

## Steps
1. Confirm current backend-first merge path and existing local storage guard.
2. Add a failing unit test where backend returns a partial record with the same id as a complete local record.
3. Filter backend records with the existing complete-record guard before merge.
4. Run targeted sync, anomaly board, risk queue, and risk evidence API tests.

## Stop Condition
- Complete backend records still participate in backend-first merge.
- Partial backend records cannot shadow complete local dispatch evidence.
- Targeted tests pass and skipped filtered tests are reported explicitly.
