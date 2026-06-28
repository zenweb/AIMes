# 2026-06-15 Plan - ChatPanel coverage leverage slice

## Objective

Harden the existing AI assistant entrypoint without broadening scope, using coverage increment as the routing signal.

## Completed

- Selected ChatPanel because it is a user-critical assistant entrypoint and remained at 75.07% statement coverage before this slice.
- Added test-only evidence for:
  - non-Ollama provider/model startup badge;
  - monitoring situation closed-evidence fallback answer;
  - quality rework impact fallback answer.
- Verified focused and full frontend test suites.

## Next Selection Rule

- Prefer the next component or ChatPanel branch with the lowest current coverage and real user-path frequency.
- Do not spend the next slice on already saturated login/a11y micro-branches unless a concrete defect appears.

