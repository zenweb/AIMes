# Plan: Employee Production Scheduling Evidence Script

## Goal
Provide a repeatable, bounded verification entrypoint for the current Employee -> Production -> Scheduling backend evidence chain.

## Steps
1. Extend architecture rules to require the script and its bounded filters.
2. Verify the architecture rule fails while the script is absent.
3. Implement the PowerShell script with build-server reset, frontend-copy opt-out, and fail-fast reporting.
4. Run the architecture rule and the script.

## Status
- Completed on 2026-06-21.

