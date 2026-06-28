# Issue - Labor Retry Plan Helper Split

Before this split, the labor retry E2E setup called `mockSchedulingPlanApis(page)`, which is tied to real dhtmlx data and tokens. That dependency kept the labor retry candidate coupled to an excluded release-candidate theme.

Resolution:

- Added a labor-only scheduling/equipment helper.
- Switched only the labor retry branch to the new helper.

Open:

- Other mixed hunks still need manual split before the staged candidate can pass the boundary guard.

