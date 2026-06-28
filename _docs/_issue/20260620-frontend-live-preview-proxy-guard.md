# 2026-06-20 Issue - Frontend live preview proxy guard

## Issue
The employee page failure report showed the risk of a live preview session surfacing offline-demo backend skip behavior at `/api/v1/employee`.

## Root cause class
- Existing source already handled offline-demo skip errors correctly in `EmployeeBoard`.
- The remaining weak point was missing automated coverage for Nuxt preview proxy routing to the live backend.

## Resolution
- Added a tested backend proxy contract for `/api/**` and `/hubs/**`.
- Default backend target is locked to `http://localhost:5003`.

## Verification
- Focused unit tests passed.
- Nuxt production build passed.
