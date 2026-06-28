# 2026-06-13 Review: LLM API contract evidence

## Review result

The chat model status/config helper now has direct API contract evidence.

## Evidence covered

- `getLlmStatus` reads `/llm/status` and returns the backend status object.
- `getLlmConfig` reads `/llm/config` and returns the backend provider configuration object.
- Chat panel regression remains green with the helper contract test present.

## Boundary

This is an existing-feature evidence slice. It does not validate provider reachability or model quality; those remain runtime/backend concerns.

