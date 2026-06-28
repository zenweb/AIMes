# 2026-06-15 Issue - AnomalyBoard residual risk

## Status

- No runtime issue found in this slice.

## Residual Risk

- AnomalyBoard still has a few uncovered branches around detail close/overlay interactions and rare fallback formatting.
- This residual risk is lower than the remaining low-coverage components because the primary anomaly user flows now have focused unit evidence.

## Mitigation

- Preserve the new tests as regression evidence for keyboard access, list fallback, dispatch audit routing, and AI-analysis fallback.
- Reopen AnomalyBoard only for a concrete defect or a real-browser regression.

