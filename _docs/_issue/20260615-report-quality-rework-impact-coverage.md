# Report quality rework impact issue note

## Issue

`ReportBoard` displayed quality rework impact evidence when present, but tests always mocked that source as absent.

## Impact

- A regression could remove the quality rework OTD block without test failure.
- The report center would be weaker as the review surface connecting production quality rework to OTD risk.

## Resolution

- Made the quality rework evidence mock controllable.
- Added a test proving the report shows the work order, recommended action, process, rework window, and OTD impact.
