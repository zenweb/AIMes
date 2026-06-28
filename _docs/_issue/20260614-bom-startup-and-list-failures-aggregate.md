# Issue - BOM startup and list failures aggregate

## Problem
- `BomBoard` used one `bomError` string for startup engineering evidence, BOM list loading, and operation-level failures.
- When startup engineering evidence loading failed and the BOM list also failed, the list fallback message overwrote the earlier engineering evidence warning.

## Impact
- Operators could see fallback BOM records while losing the warning that engineering evidence sync was also degraded.
- This weakened fail-loud behavior for the BOM -> scheduling constraint chain.

## Fix
- Added startup, list, and operation alert lanes.
- The visible `bomError` now composes all active lanes.

## Verification
- Unit and Chromium tests now prove both failure messages remain visible together.
