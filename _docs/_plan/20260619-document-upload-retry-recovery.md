# Plan — Document Upload Retry Recovery

## Success Criteria
- Failed document uploads remain visible with the original file retained.
- The operator gets bilingual guidance and a help link for recovery.
- The failed file can be retried in place and then records normal upload history on success.
- Existing upload, queue, governance, coverage, lint, build, and browser rendering checks remain green.

## Execution
1. Inspect existing DocumentUpload queue/error behavior and tests.
2. Add RED test for in-place retry with bilingual guidance and help link.
3. Implement minimal retry state transition and UI recovery block.
4. Validate target test, component suite, full coverage, lint, build, and production-preview browser rendering.

## Status
Implemented and verified on 2026-06-19. Overall CC remediation goal remains active because release-level gray observation is not proven complete.
