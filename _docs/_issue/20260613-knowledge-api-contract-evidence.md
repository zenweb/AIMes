# 2026-06-13 Issue: Knowledge API helper had no direct contract evidence

## Status

Closed for this slice.

## Finding

`src/api/knowledge.ts` was a zero-coverage helper even though chat and document upload depend on it.

## Resolution

Added a direct API contract test covering query, history, and multipart upload behavior.

## Remaining risk

This verifies frontend request construction. Backend indexing correctness and RAG answer quality remain covered by their own integration or runtime evidence, not this unit slice.

