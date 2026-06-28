# Issue: Assistant closure failure could interrupt completed expedited receipt

Date: 2026-06-19

## Status

Resolved in this slice.

## Problem

`PurchaseBoard` completed expedited shortage receipt and wrote shortage/OTD evidence before attempting to close the related AI assistant purchase action. If the assistant recovery package lookup failed, the rejection escaped the handler after the primary purchase receipt path had already completed.

## Impact

The UI could lose the explicit fail-loud state for the assistant closure boundary and risk confusing the operator about whether the purchase receipt itself succeeded.

## Resolution

- Added a failing regression for successful expedited receipt followed by assistant recovery backend failure.
- Wrapped assistant recovery lookup and purchase-action closure in a secondary `try/catch`.
- Preserved the mitigated shortage state and receipt evidence while showing an alert that assistant closure still needs follow-up.
- Verified targeted, component, full frontend coverage, and lint.
