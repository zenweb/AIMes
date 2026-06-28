# 2026-06-15 Knowledge Citation Inventory Routing Coverage Issue

## Issue

AI assistant citation routing had strong quality-reuse evidence, but weaker explicit evidence that governance-reviewed sources propagate consistently through the citation inventory while unrelated questions remain isolated.

## Risk

Without focused evidence, regressions could:

- make the citation inventory disagree with direct question routing;
- attach CNC governance evidence to unrelated top-risk questions;
- accidentally turn review-only answers into formally citable answers.

## Resolution

Added focused tests to `src/frontend/tests/unit/knowledge-citations.test.ts`.

## Evidence

- `knowledge-citations.test.ts`: 9 passed.
- Focused `src/utils/knowledge-citations.ts` coverage: 86.36% lines, 65.55% branches.
- Citation/governance/quality-knowledge regression: 40 passed.

