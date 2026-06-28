# 2026-06-20 Issue - Customer POC Latest Seed Evidence

## Problem

Real browser scans showed background 404s for `customer-order-import/latest` and `customer-equipment-fault/latest` across customer-facing report/audit/admin/equipment evidence flows.

## Root Cause

The backend contracts were implemented, but no default customer POC latest evidence was seeded into `agent_evidence_links`.

## Resolution

- Added seeded customer order import evidence.
- Added seeded customer equipment fault evidence.
- Added Docker recovery SQL and executed it on the current local PostgreSQL volume.

## Verification

- Integration test for customer POC latest evidence passes.
- Direct API calls return 200.
- Real browser scans show both customer latest reads returning 200 and no user-visible request-error toast.

