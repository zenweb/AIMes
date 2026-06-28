# 2026-06-15 API port 5003 local default issue

## Problem

The project had already moved away from forbidden host `5000`, but the next default host port was `5002`. On this workstation, `5002` is occupied by another local service, so continuing to use it would cause repeated local startup or browser-evidence failures.

## Resolution

Move the active AIMes local default to `5003`, which is currently free, and keep `5004` as the documented conflict override example.

Follow-up cleanup also moved remaining current-run fallbacks from `5002` to `5003` so live staging e2e and startup banner guidance do not drift from the new default.

Verification confirmed the current runtime/script/operator entry points no longer default to host `5000` or `5002`.

## Scope

- Runtime config and scripts only.
- Current operator docs only.
- Historical evidence files intentionally left untouched.
