# 2026-06-15 audit replay CAPA invalid payload coverage issue

## Issue

`AuditDecisionReplayPanel.vue` had the lowest current component line coverage and owns phase-one audit replay behavior. Existing tests covered valid CAPA closure replay, but did not prove the behavior for incomplete CAPA replay payloads.

## Impact

If incomplete backend CAPA evidence were accepted silently, the audit replay UI could imply a complete quality closure trail when required audit fields are missing.

## Resolution

Added a unit test that feeds an incomplete CAPA payload and verifies:

- base replay cards remain visible;
- the selected replay chain falls back to the base rush-order replay;
- the panel raises an assertive alert containing `质量 CAPA 闭环加载失败`;
- the alert explains the payload is incomplete.
