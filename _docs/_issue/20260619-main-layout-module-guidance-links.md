# Issue: MainLayout lacked active-module guidance links

Date: 2026-06-19

## Problem

The global shell showed the active module name and description, but it did not give operators a direct path to related evidence or help before complex module operations.

## Impact

Operators entering AI scheduling could proceed into optimization, adoption, or writeback workflows without a shell-level reminder to check scheduling constraints, delivery evidence, audit replay, and support guidance first.

## Fix

Added a `module-guidance` section and `#module-help` target to `MainLayout.vue`, with responsive styling in `MainLayout.css`. The scheduling route now has specific bilingual guidance and links to scheduling, report, audit logs, and help.

## Evidence

- Unit RED/GREEN test: `guides operators from the active module to related evidence and help`.
- Full frontend coverage: 111 files / 1084 tests passed.
- Production-preview browser evidence:
  - `_docs/_reports/main-layout-module-guidance-browser-20260619.json`
  - `_docs/_reports/main-layout-module-guidance-browser-20260619.png`
