# Plan: Scanner guidance links

Date: 2026-06-19

## Success criteria

- ScannerBoard shows bilingual guidance before camera scan or manual lookup.
- Guidance links connect operators to production reporting, audit replay, reporting evidence, and local help.
- A help anchor explains the expected post-scan context verification in both English and Simplified Chinese.
- Targeted, component, full unit coverage, and lint checks pass.

## Execution

1. Add a failing ScannerBoard unit test for guidance copy, links, and help anchor.
2. Add the smallest ScannerBoard template/style change that satisfies the test.
3. Run targeted and full component tests.
4. Run full frontend coverage and lint.
5. Record changelog, review, todo, issue, and plan documents.

## Outcome

Completed. The scanner guidance and help affordances are covered by tests, and frontend coverage/lint are green.
