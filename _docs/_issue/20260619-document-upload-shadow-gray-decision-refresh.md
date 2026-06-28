# Issue: Shadow gray publish decision refresh needed direct proof

Date: 2026-06-19
Status: Resolved for this slice

## Problem

`DocumentUpload` refreshed gray decision records after successful quality experiment shadow gray publish, but the test suite did not directly prove that the refreshed decision reached the governance panel.

## Resolution

Added a focused unit test that triggers `quality-experiment-shadow-gray-published`, stubs the governance panel, and verifies the refreshed gray decision evidence is visible through the child prop contract.

## Evidence

- Target test passed.
- Full DocumentUpload suite passed.
- Full frontend coverage and lint passed.
