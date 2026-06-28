# 2026-06-19 Issue: Offline demo login entry blocked by forced password change

## Symptom
- User reported `用户名或密码错误` when trying the preview login.

## Root Cause
- `admin / admin123` is a demo credential in the frontend auth store.
- In production preview, demo login is only preferred when `offlineDemo=1` is present.
- Once demo login was enabled, the demo auth user still had `mustChangePassword: true`, which redirected to a backend-dependent change-password flow.

## Fix
- Persist demo users with `mustChangePassword: false`.

## Evidence
- RED/GREEN auth store tests.
- Real browser verification reached `/scheduling/dashboard`.

## Boundary
- This does not change real backend password validation.
