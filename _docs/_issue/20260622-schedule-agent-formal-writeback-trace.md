# Issue - Schedule Agent Feedback Could Look Like Formal Writeback

## Problem

The existing Scheduling Agent workflow could show a successful adoption feedback trail while the formal schedule plan had not yet been optimized, dragged, or saved.

That ambiguity weakens the boutique-quality requirement for the user-critical scheduling path: a dispatcher needs to know whether an Agent recommendation is only recorded as decision feedback or has actually changed the formal production schedule.

## Fix Direction

- Track formal schedule writeback as `pending` or `saved`.
- Set the state to `pending` when a rush-order Agent recommendation is accepted.
- Set the state to `saved` only after a successful optimization or drag reschedule writeback.
- Surface the distinction in the Agent workbench execution trace.

## Evidence

- Unit coverage now proves pending and saved states in both the panel and parent board integration.
