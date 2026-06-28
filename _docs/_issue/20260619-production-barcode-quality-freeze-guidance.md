# 2026-06-19 Issue: Production barcode quality freeze guidance

## Problem
- After scanned completion failed the quality gate, the barcode context became frozen but the action area did not state why actions were unavailable.

## Impact
- Operators could see generated freeze/CAPA evidence but lack a direct instruction for the next step.
- This violated the product principle that complex operations need visible prompts and help/support affordances.

## Root Cause
- The barcode context template handled `pending`, `in_progress`, and `completed` operation states, but not `paused`.

## Fix
- Render a clear frozen-state message for `paused` barcode operations.

## Evidence
- RED test reproduced the missing message.
- Full frontend regression passed after the fix.
