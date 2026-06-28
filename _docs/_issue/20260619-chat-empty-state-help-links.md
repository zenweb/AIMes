# Issue: Chat assistant empty state lacked bilingual guidance and help affordance

Date: 2026-06-19
Status: Resolved for this slice

## Problem

The AI production assistant empty state only gave a short Chinese prompt and examples. It did not provide English guidance, related evidence links, or a clickable help path for complex assistant actions.

## Impact

First-time operators could open a complex AI action surface without clear guidance on asking for evidence first, finding related records, or getting help before cross-module actions.

## Resolution

Added bilingual empty-state examples, contextual links to report and audit evidence, and an in-panel help section that explains evidence-first assistant usage.

## Evidence

- Targeted RED/GREEN test completed.
- Full `ChatPanel` suite passed.
- Full frontend coverage passed.
- Frontend lint passed.
