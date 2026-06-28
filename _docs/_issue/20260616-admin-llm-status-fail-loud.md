# 2026-06-16 Admin LLM Status Fail Loud Issue

## Status

Closed for this slice.

## Problem

Admin LLM status loading converted endpoint failures into a silent disconnected panel.

Scenario:

- Admin opens `LLM 设置`.
- The LLM status endpoint is unavailable.
- The panel shows provider/model as `-` and connectivity as `未连接`.

Before the fix, there was no visible alert explaining that the admin status probe itself failed.

## Resolution

`loadLlmStatus` now writes a visible notification: `LLM 状态加载失败，当前模型连通性不可确认：...`.

## Evidence

- Regression test failed before the fix because `[role="alert"]` was missing.
- Regression test passed after the fix.
- Admin targeted coverage passed with `27 passed`.
- Full frontend coverage passed with `111 files / 1056 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
