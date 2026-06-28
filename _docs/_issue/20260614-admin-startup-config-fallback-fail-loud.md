# Issue - Admin startup config fallback fail loud

## Problem
- `AdminBoard` collected governance evidence startup failures, but system config and notification config read failures used local demo fallback without being guaranteed a visible startup warning.
- In offline-demo or multi-source failure cases, the alert summary could list other governance failures first and hide config fallback failures behind `另有 N 项`.

## Impact
- Admin users could see system config and notification config fallback rows without realizing those rows were not backend-authoritative.
- This weakened fail-loud behavior on an admin-critical startup path.

## Fix
- Reused one startup failure collection for governance evidence, system config, and notification config loading.
- Added system config and notification config failures to the front of the alert summary.

## Verification
- Unit and Chromium tests now prove the config fallback warning remains visible while fallback data still renders.
