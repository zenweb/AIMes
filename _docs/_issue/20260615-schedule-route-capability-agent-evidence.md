# 2026-06-15 Issue - ScheduleBoard 工艺能力 Agent 采纳证据

Issue:
- Route capability validation could enter the schedule event chain, but there was no focused test proving that a validated capacity gap generates a blocking Agent suggestion and preserves the engineering audit evidence after adoption.

Impact:
- A regression could have hidden the capacity-gap audit ID or weakened the "wait for engineering/manufacturing confirmation" reason while tests still passed.

Resolution:
- Added a unit test for the route capability blocking path with a heat-treatment capacity gap.
- Verified local feedback snapshot and backend adoption feedback keep route-event category and engineering evidence.

Not fixed here:
- Full live browser staging remains blocked by external Docker/API state.
