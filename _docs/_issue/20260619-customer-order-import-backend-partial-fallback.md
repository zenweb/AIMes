# 2026-06-19 Issue: Customer order import backend partial fallback

## Problem
- Customer order import backend-first reads trusted partial backend payloads.
- A payload with counts but without mapped field lineage, file, source, or prepared timestamp could replace a complete local POC sample.

## Impact
- POC governance and knowledge intake could show imported order counts without the field-mapping evidence needed to audit customer data lineage.

## Root Cause
- `isCustomerOrderImportEvidence` guarded local storage reads but was not applied to backend-first reads.

## Fix
- Applied the existing completeness guard to backend-first records before returning them.
- Incomplete backend results now fall back to complete local evidence.

## Evidence
- RED test reproduced direct partial backend return.
- GREEN and adjacent knowledge/POC checks passed after the fix.
