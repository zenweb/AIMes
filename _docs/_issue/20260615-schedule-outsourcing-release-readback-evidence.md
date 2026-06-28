# 2026-06-15 Schedule Outsourcing Release Readback Evidence Issue

## Problem

`ScheduleBoard` had evidence for adopting an outsourcing arrival suggestion and archiving release evidence, but lacked a focused readback assertion that an already released outsourcing package generates the OTD review suggestion rather than attempting release again.

## Impact

Without this evidence, a regression could re-trigger release confirmation or show the wrong next action after release evidence had already been archived.

## Resolution

Added a focused unit test that starts from an already released outsourcing package, verifies the released event readback, and asserts suggestion generation stays in OTD review mode without calling release confirmation.
