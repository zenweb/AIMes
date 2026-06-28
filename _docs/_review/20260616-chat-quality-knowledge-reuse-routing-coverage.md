# 2026-06-16 Chat Quality Knowledge Reuse Routing Coverage Review

## Decision

Accepted as a boutique hardening slice for the existing AI production assistant.

## Root Cause

Questions like `扫码返工同类质量问题如何复用 CAPA 推荐？` contain both quality/rework keywords and reuse/recommendation keywords. The broad quality rework impact branch ran before the quality knowledge reuse branch, so the assistant returned a generic `质量返工影响` fallback instead of the deeper CAPA reuse answer.

## Fix

- Added an explicit `isQualityKnowledgeReuseIntent` classifier.
- Prevented the quality rework impact branch from claiming reuse/recommendation questions.
- Reused the same classifier for the quality knowledge reuse answer branch.

## Evidence

- The new test failed before the production fix and passed after it.
- Existing `quality rework impact` test still passes, proving the broader quality rework route was not broken.
- Full frontend coverage passed with `111 files / 1051 tests`.

## Risks

- Intent routing remains keyword-based and order-sensitive; future assistant intents should add focused tests before changing branch order.
- Strict final v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- Worktree remains broadly dirty; future work must avoid reverting unrelated changes.
