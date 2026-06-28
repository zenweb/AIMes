# 2026-06-19 Plan: BOM Kitting Guidance Links

## Goal
Bring the existing BOM kitting package release flow closer to boutique quality by adding bilingual guidance, related evidence links, and local help at the point where operators generate the kitting package.

## Scope
- Existing `BomBoard` BOM-A100 kitting source panel only.
- No new BOM workflow.
- No changes to kitting package creation, OTD evidence writeback, BOM explosion, or backend APIs.

## Steps
1. Add a RED test requiring bilingual guidance and related evidence links in the BOM kitting panel.
2. Add minimal markup and local styles inside the existing panel.
3. Run targeted, component, full coverage, lint, build, and browser checks.
4. Record changelog, review, todo, issue, and plan artifacts.

## Stop Condition
- The BOM kitting panel displays Simplified Chinese and English guidance.
- The panel links to scheduling, inventory, audit replay, and local help.
- Tests and browser evidence prove the behavior.
