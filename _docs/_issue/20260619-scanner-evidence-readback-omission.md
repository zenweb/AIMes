# 2026-06-19 Issue: Scanner evidence readback omission

## Problem
- Barcode scan evidence confirmation could silently lose visible confirmation state when backend readback returned an empty or stale evidence list after a successful local write.

## Impact
- Operators might see the scan evidence panel return to the unconfirmed hint even though the local write succeeded.
- This weakens audit confidence because the UI does not distinguish "not written" from "written locally but omitted by backend readback".

## Root Cause
- `ScannerBoard` replaced `scanEvidenceRecords` directly with the backend readback result after write success.
- The code did not verify that the just-written record was present in the refreshed records.

## Fix
- Preserve the local record and show `扫码证据读回缺失` when refreshed records omit the written `id` or normalized scan `code`.

## Evidence
- RED test reproduced the missing alert and unconfirmed panel.
- GREEN and full frontend regression passed after the fix.

## Follow-up API Contract Gap
- Problem: the component had UI containment, but release/staging checks lacked a frontend helper contract that waits for backend persistence and proves readback includes the just-written barcode scan record.
- Fix: added `writeBarcodeScanEvidenceRecordAndReadBack`, which posts the record, queries backend evidence with fail-loud behavior, requires a matching `id`, persists the backend-confirmed record locally, and throws `barcode scan evidence readback missing: <id>` when readback is stale.
- Evidence: targeted helper test now proves backend-confirmed records replace local scanner records and refresh the OTD evidence-chain trace after write/readback.
