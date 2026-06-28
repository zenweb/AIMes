# 2026-06-15 Shortage Risk Backend-First All-Record Fallback Coverage Issue

## Issue

The first backend-first fallback hardening covered incomplete BOM, supply escalation, and supplier-network backend records, but did not directly assert the same behavior for shortage resolution and shortage kitting event records.

## Risk

Without direct assertions, a future change could reintroduce partial backend evidence for the closed-loop shortage resolution or kitting event paths.

## Resolution

- Added complete local fixtures for shortage resolution and shortage kitting event records.
- Extended the incomplete-backend fallback test to cover both additional record types.
- Verified targeted, full frontend unit, and full frontend coverage commands.

## Boundary

This issue closes a coverage/evidence gap in an existing path. It does not change the shortage feature's user-facing scope.
