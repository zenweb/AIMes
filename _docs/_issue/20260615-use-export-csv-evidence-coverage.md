# 2026-06-15 useExport CSV Evidence Coverage Issue

## Issue

The shared CSV export hook had limited evidence for filename traceability, data-row escaping, and temporary DOM cleanup.

## Risk

Without focused evidence, regressions could:

- generate exported evidence files without stable timestamped names;
- corrupt rows containing commas, quotes, or newlines;
- leave temporary download anchors in the DOM after export.

## Resolution

Added focused tests to `src/frontend/tests/unit/use-export.test.ts`.

## Evidence

- `use-export.test.ts`: 3 passed.
- Focused `src/composables/useExport.ts` coverage: 100%.
- Export hook + report + schedule regression: 88 passed.

