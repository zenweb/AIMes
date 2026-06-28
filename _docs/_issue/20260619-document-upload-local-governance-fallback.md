# Issue: Local governance fallback needed direct proof

Date: 2026-06-19
Status: Resolved for this slice

## Problem

The suite already proved that a backend quality evidence refresh failure raised an alert, but it did not prove that local governance documents stayed visible to the operator.

## Resolution

Added a focused unit test that injects local governance documents, forces backend refresh failure, and verifies both the alert and the preserved governance queue content.

## Evidence

- Target test passed.
- Full DocumentUpload suite passed.
- Full frontend coverage and lint passed.
