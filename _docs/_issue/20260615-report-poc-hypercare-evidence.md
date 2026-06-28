# 2026-06-15 Issue: Backend Hypercare evidence lacked the summary panel without local pilot run

## Problem
- `ReportBoard` rendered the detailed Hypercare package when a backend Hypercare record existed, but the top Hypercare summary panel was gated only by `pocPilotRun`.

## Impact
- A user opening the report from backend evidence could see detailed cards but miss the active summary that explains status, owner, and OTD/OEE headline.

## Resolution
- Changed the summary panel gate to render when either `pocPilotRun` or `pocHypercareAcceptance` exists.
- Added focused report and CSV coverage for backend-first Hypercare acceptance evidence.
