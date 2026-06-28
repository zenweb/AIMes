# 2026-06-16 BOM Pagination Detail Reset Review

## Decision

Accepted for the current boutique hardening track.

## Scope

- Component: `src/frontend/src/components/bom/BomBoard.vue`.
- Test: `src/frontend/tests/unit/bom-board.test.ts`.
- Workflow: BOM list pagination after an operator has selected a BOM detail.

## Findings

- Before the fix, `goToPage()` changed `currentPage` and loaded the new list, but left `selected` and `explosion` untouched.
- This allowed page 2 to show a different BOM list while the detail panel still displayed the previous page's BOM.
- In a BOM governance screen, stale detail can mislead operators into running ECN, alternate-material, or kitting actions against the wrong visible context.

## Verification

- Red-first test reproduced the mismatch: page 2 list showed `产品C 物料清单`; detail still showed `产品A 物料清单`.
- Single-test green: `1 passed | 20 skipped`.
- Targeted BomBoard coverage: `21 passed`; lines `88.7%`.
- Full frontend coverage: `111 files / 1061 tests passed`; lines `92.66%`.

## Residual Risk

- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- Worktree contains many unrelated edits; this review covers only the BomBoard pagination detail reset slice.
