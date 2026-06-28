# Report quality rework impact coverage plan

## Success criteria

- ReportBoard can be tested with quality rework evidence present.
- The report displays the affected work order, rework process, rework hours, OTD impact, and recommended action.
- Existing report export and fail-loud tests remain green.

## Steps

1. Inspect coverage output and choose a higher-leverage report-center slice.
2. Make the quality rework mock controllable.
3. Add targeted quality rework impact rendering coverage.
4. Run targeted, report-suite, related quality-suite, and coverage validation.

## Result

Completed for this slice. Existing report UI already met the behavior; regression coverage was added.
