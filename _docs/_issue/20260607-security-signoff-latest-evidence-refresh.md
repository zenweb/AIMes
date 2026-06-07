# Issue: Security Signoff Packet Had Stale Evidence References

## Problem

The 2026-06-07 security signoff packet still referenced earlier hosted CI runs and older security evidence filenames. That could slow review or cause a signer to inspect outdated artifacts.

## Fix

Updated the packet to point to current security evidence, the manual verification packet, and the latest successful hosted CI / Agent Evaluation runs.

## Boundary

The signoff remains unsigned. This issue only removes stale references; it does not close the release gate.
