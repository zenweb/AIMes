# 2026-06-19 Issue: Equipment Diagnosis Lacked Operation Guidance Links

## Problem
- The equipment fault diagnosis workflow is a complex operation, but the diagnosis tab did not explain what evidence operators should review before running diagnosis.
- The UI did not expose related points as links from diagnosis to schedule impact, maintenance history, or local help.

## Impact
- Operators could start diagnosis without checking current work order impact, health anomalies, maintenance records, or downtime scheduling consequences.
- This weakened the Core Product Principles for multilingual support, contextual linking, and complex-operation guidance.

## Resolution
- Added bilingual diagnosis guidance and related links.
- Added a stable help anchor and `aria-describedby` on the diagnosis form.

## Evidence
- `equipment-diagnosis-guidance-real-browser-20260619`
- `npm run test:unit:coverage` passed 111 files / 1099 tests.

