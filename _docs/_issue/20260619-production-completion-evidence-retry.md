# Issue: Production completion retry was blocked after evidence archival failure

Date: 2026-06-19

## Status

Resolved in this slice.

## Problem

When backend completion succeeded but OTD/quality evidence archival failed, `ProductionBoard` showed the fail-loud alert but left completion retry blocked. The optimistic local operation and work-order state could also remain completed even though evidence archival had not succeeded.

## Impact

Operators could be unable to retry completion evidence archival from the same dialog. The UI could also imply the production completion was fully closed while audit evidence was missing.

## Resolution

- Added a failing regression for backend completion success followed by evidence archival failure and retry.
- Released the completion submitting guard on evidence archival failure.
- Restored the previous local operation and work-order state on evidence archival failure.
- Verified targeted, component, full frontend coverage, and lint.
