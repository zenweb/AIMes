# 2026-06-15 Issue: Knowledge governance replay lacked source route

## Problem

Knowledge governance review replay cards exposed the reviewed document title, version upgrade, audit id, trace id, validity window, and references, but did not provide a route back to the source document governance surface.

## Impact

- Audit reviewers could confirm that a document was reviewed, but could not jump from the replay detail back to the governed source document.
- The chain "AI knowledge citation -> audit replay -> source document governance" was weaker than other replay chains that already expose labelled object links.

## Fix

- Added a regression test that injects a knowledge governance review and asserts the replay is selected with audit id, trace id, validity window, references, and `打开文档治理`.
- Added `/knowledge` route metadata to the knowledge governance replay mapper.

## Verification

- RED target test: 1 failed / 29 passed, missing `.trace-link`.
- GREEN target test: 30/30 passed.
- Full frontend coverage: 963/963 passed.

## Status

Closed for the frontend audit replay mapper. Route consumption by the `/knowledge` page remains a possible follow-up validation item.
