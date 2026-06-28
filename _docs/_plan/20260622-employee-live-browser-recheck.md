# Plan - Employee Live Browser Recheck

## Success Criteria

- Live login succeeds through the preview proxy.
- Employee list requests the real backend.
- The page does not show offline-demo skip text.
- No current staged release candidate files are disturbed.

## Steps

1. Inspect the employee/offline-demo frontend path.
2. Use real browser automation against `4173`.
3. Force live mode with `offlineDemo=0` and clear stale local storage.
4. Log in and navigate to employee management.
5. Record API responses and visible UI result.

## Status

Complete.
