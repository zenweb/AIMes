# 2026-06-16 Routing Pagination Detail Reset Issue

## Status

Closed for this slice.

## Problem

Routing pagination changed the list page without clearing the selected route detail.

Scenario:

- Operator selects `传动轴总成工艺路线` on page 1.
- Operator moves to page 2.
- The left route list shows `液压阀体工艺路线`.
- The right detail panel still shows `传动轴总成工艺路线`.

## Resolution

`RoutingBoard.vue` now clears `selected` when `goToPage` accepts a new page. The detail panel returns to the empty selection prompt until the operator selects a route on the newly loaded page.

## Evidence

- Regression test failed before the fix because page 2 still displayed the previous route detail.
- Regression test passed after the fix: `1 passed | 11 skipped`.
- RoutingBoard targeted coverage passed with `12 passed`.
- Full frontend coverage passed with `111 files / 1059 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
