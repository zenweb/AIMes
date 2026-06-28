# 2026-06-15 Plan: Document upload queue and governance coverage

Success criteria:
- Cover DocumentUpload queue handling that operators use directly.
- Prove in-flight uploads cannot be removed by clearing the queue.
- Prove successful uploads enter knowledge governance with the selected category.
- Verify focused DocumentUpload tests and full frontend unit coverage.

Execution:
1. Inspect existing DocumentUpload tests and coverage JSON.
2. Add drag/drop duplicate suppression and remove coverage.
3. Add clear-while-uploading coverage.
4. Add governance-boundary coverage for successful upload.
5. Run focused and full frontend coverage.

Outcome:
- Completed. DocumentUpload focused coverage improved to statements 82.67%, branches 66.66%, functions 87.30%, lines 87.23%.
