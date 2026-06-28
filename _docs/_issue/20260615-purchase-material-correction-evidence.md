# 2026-06-15 Issue: purchase material correction success path lacked direct evidence

## Problem
- PurchaseBoard had a failure guard for material supplier correction audit writes, but no direct positive regression proving the corrective-action success path writes both supply-risk and OTD evidence.

## Impact
- A key procurement recovery path could regress while surrounding failure-path tests stayed green.

## Resolution
- Added a success-path unit test for routed material anomaly correction.
- No production code change was needed; the current implementation already satisfied the expected behavior.
