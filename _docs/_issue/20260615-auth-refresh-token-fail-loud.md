# 2026-06-15 Issue - Auth Refresh Token Fail Loud

## Issue

Backend login responses with a blank refresh token were accepted and could persist an access token plus user without a usable refresh token.

## Impact

That creates partial auth evidence and can make the next session refresh fail later instead of failing at login time.

## Resolution

- Validate the normalized refresh token before saving auth state.
- Lock the behavior with a focused unit test.

## Status

- Closed for this slice.

