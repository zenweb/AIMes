# Plan: BOM kitting OTD sync fail-loud lock

## Goal

Bring the existing BOM kitting release path closer to boutique reliability by preventing duplicate releases when secondary evidence sync fails.

## Steps

1. Read current `BomBoard` publication flow and tests.
2. Add a failing test for successful BOM kitting package write followed by OTD evidence-chain failure.
3. Change only the publication error boundary so the primary action locks after successful package persistence.
4. Keep OTD sync failure visible through the existing alert surface.
5. Verify target unit test and full frontend coverage.

## Result

The BOM kitting package now locks after primary persistence succeeds, even if OTD evidence-chain sync fails. The operator sees the evidence-chain failure and cannot duplicate the primary release.
