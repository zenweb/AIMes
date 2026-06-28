# 2026-06-19 Plan: Quality Barcode Knowledge Guidance Links

## Goal
Bring the existing barcode quality knowledge reuse flow closer to boutique quality by adding bilingual guidance, related evidence links, and local help at the point where operators publish CAPA knowledge samples.

## Scope
- Existing `QualityBoard` barcode quality knowledge panel only.
- No new quality workflow.
- No changes to CAPA sample creation, evidence writeback, release behavior, or backend APIs.

## Steps
1. Add a RED test requiring bilingual guidance and related evidence links in the barcode quality knowledge panel.
2. Add minimal markup and local styles inside the existing panel.
3. Run targeted, component, full coverage, lint, build, and browser checks.
4. Record changelog, review, todo, issue, and plan artifacts.

## Stop Condition
- The barcode quality knowledge panel displays Simplified Chinese and English guidance.
- The panel links to audit replay, report evidence, and local help.
- Tests and browser evidence prove the behavior.
