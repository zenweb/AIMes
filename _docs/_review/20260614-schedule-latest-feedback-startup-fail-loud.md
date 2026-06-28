# Review - Schedule latest feedback startup fail loud

## Scope
- Reviewed `src/frontend/src/api/scheduling.ts`.
- Reviewed `src/frontend/src/components/schedule/ScheduleBoard.vue`.
- Reviewed `src/frontend/tests/unit/scheduling-api.test.ts`.
- Reviewed `src/frontend/tests/unit/schedule-board.test.ts`.
- Reviewed `src/frontend/tests/e2e/scheduling.spec.ts`.
- Reviewed API host-port defaults in Docker/staging evidence entry points.

## Findings
- No open issue remains in the latest-feedback startup slice after focused unit and Chromium verification.
- RED confirmed the original weakness: a latest feedback restore failure could abort the mounted startup chain before the main schedule plan loaded.
- API swallowing made backend latest-feedback failures indistinguishable from an intentionally empty latest-feedback result.

## Decision
- Kept latest-feedback restore as non-blocking startup work.
- Let `getLatestAdoptionFeedback()` propagate backend errors so the component layer owns fallback and user-visible messaging.
- Reused the existing schedule sync note path instead of adding another banner.
- Changed Docker host mapping to `5002:5000`; the container can keep listening on `5000` internally while users hit `localhost:5002`.

## Residual Risk
- Host port `5002` is currently occupied by another local project process, so a live Docker run will still fail until that process is stopped or AIMes is run on a different host port.
- Known coverage warning remains: `--localstorage-file was provided without a valid path`.
