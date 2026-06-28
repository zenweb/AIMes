# Issue - Schedule latest feedback startup fail loud

## Problem
- `ScheduleBoard` restored latest adoption feedback during startup before loading the main schedule data.
- When the latest feedback endpoint failed, the startup chain could stop before `getCurrentPlan()` ran.
- The API wrapper returned `null` on latest-feedback backend failure, hiding the difference between "no latest feedback" and "backend unavailable".

## Impact
- Users could lose the main scheduling view because an auxiliary restore endpoint failed.
- Backend data loss or service failure could look like an empty latest-feedback state instead of a visible degraded mode.

## Fix
- `getLatestAdoptionFeedback()` now lets backend failures propagate.
- `ScheduleBoard` catches latest-feedback restore failure, shows a fail-loud sync note, falls back to local recent feedback, and continues loading the plan.
- API/staging defaults now prefer `localhost:5002` instead of `localhost:5000`.

## Verification
- Focused API unit, focused ScheduleBoard unit, and focused Chromium e2e all pass.

## Open Environment Note
- `localhost:5002` is occupied by PID `40468` (`learun.webapi.exe`) outside AIMes. Docker-backed AIMes startup on 5002 requires freeing that port first.
