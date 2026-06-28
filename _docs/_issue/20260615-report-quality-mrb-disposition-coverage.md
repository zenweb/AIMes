# 2026-06-15 Issue: MRB report evidence lacked focused report coverage

## Problem
- `ReportBoard` rendered and exported quality MRB disposition evidence, but the report unit suite did not prove that MRB closure evidence appeared in either the OTD review report or CSV pack.

## Impact
- A template or export regression could hide MRB closure evidence without a focused report test failure.

## Resolution
- Added a targeted report unit test with controlled MRB backend-first evidence.
- Verified visible report content and CSV export rows.
