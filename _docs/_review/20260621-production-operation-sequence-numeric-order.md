# 2026-06-21 Review - Production operation sequence numeric order

## Review Result

PASS for this slice.

## Checked

- `OP-2` now sorts before `OP-10`.
- The first operation selected by work-order barcode scan and the next operation used for barcode handoff share the same ordering rule.
- The change stays in application logic and does not require schema changes.

## Residual Risk

- Operation codes without any digits sort after numbered operation codes and then by code text. This matches current data expectations; if the product adds explicit route-step sequence fields, scan ordering should move to that persisted field.
