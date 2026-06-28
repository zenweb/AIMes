# 2026-06-15 Issue: overlapping chat actions needed explicit regression evidence

## Problem
- ChatPanel can combine action suggestions from direct navigation intent and domain-specific intent groups.
- Without a regression, an engineering constraint prompt could accidentally show duplicate navigation buttons and make the assistant workflow noisy.

## Impact
- Operators could see repeated actions for the same route, reducing trust in the assistant's guidance.

## Resolution
- Added a focused unit test that proves overlapping engineering constraint prompts render each key navigation action only once.
- No production fix was needed.

## Open
- Docker-backed host `5002` smoke remains pending because the current Docker Server connection fails.
