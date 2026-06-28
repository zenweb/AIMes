# 2026-06-14 Issue - Anomaly Detail Alert Persists After Analysis

## Problem
- If anomaly detail loading failed and fell back to local demo detail, the fail-loud alert was visible.
- When the user then ran AI analysis successfully, the detail-load failure disappeared even though the detail still came from fallback data.

## Root Cause
- AnomalyBoard used a single `notification` string for multiple alert concerns.
- `handleAnalyze()` cleared that shared string before running analysis.

## Fix
- Added separate startup, detail, analysis, and operation notification lanes.
- Recomputed the visible alert from all active lanes.
- Allowed AI analysis success to clear only analysis state, not detail-load failure state.

## Remaining Issue
- Full frontend coverage still reports `--localstorage-file was provided without a valid path`.
- This warning remains outside this slice.

