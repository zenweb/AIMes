# 2026-06-12 Schedule Read Model Display Names Issue

## Issue
- Real backend schedule item DTOs did not populate `workOrderNumber` or `equipmentName`.

## Impact
- The frontend gantt mapper uses `workOrderNumber` for task text and `equipmentName` for equipment/tooltips.
- Mocked browser tests could pass because their route fixtures supplied these fields, while live API data could render low-quality or empty labels.

## Root Cause
- `SchedulingAppService.MapToSchedulePlanDto` mapped only ids and timing fields from `ScheduleItem`.
- It did not enrich the read model from the work order and equipment repositories.

## Resolution
- Added application-layer enrichment for distinct work order and equipment ids when returning schedule plans through query methods.
- Added tests at service and HTTP controller levels.

## Status
- Resolved for application and HTTP read models.
- Live browser staging proof remains pending as a separate evidence slice.
