# Plan: HTTP HTML fallback detection

## Goal

Improve the existing frontend HTTP layer so backend-unavailable SPA fallback responses fail loud even when the server omits `text/html`.

## Steps

1. Read the current HTTP interceptor and existing refresh/fallback tests.
2. Add a failing test for `<html>` fallback response without content type.
3. Make the smallest interceptor change to classify `<html` as fallback.
4. Re-run the target test.
5. Re-run adjacent API wrapper tests.
6. Record changelog, review, issue, todo, and plan artifacts.

## Result

The interceptor now rejects both `<!doctype html` and `<html` fallback bodies. Target and adjacent API tests pass.
