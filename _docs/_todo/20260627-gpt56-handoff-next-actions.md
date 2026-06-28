# 2026-06-27 GPT-5.6 Handoff Next Actions

## Hold State

- Status: HOLD FOR GPT-5.6.
- Do not continue broad E2E chasing before GPT-5.6 reviews this handoff.
- Do not mark the main goal complete.

## Next Execution Path

1. Open `_docs/_reports/20260627-gpt56-handoff-current-state.md`.
2. Inspect the latest Report error artifacts:

```powershell
cd C:\AIWorks\AIMes\v1
Get-ChildItem src\frontend\test-results -Directory |
  Where-Object { $_.Name -like 'report-*' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 10 Name,LastWriteTime
```

3. Start with one focused Report test:

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/report.spec.ts -g "展示 POC 评估模板与售前 checklist"
```

4. If the failure is again login/dashboard looping, audit Report live/offline fixtures and auth refresh behavior before editing UI assertions.
5. After the first focused Report red is green, run:

```powershell
npm run test:e2e -- tests/e2e/report.spec.ts
```

6. Only after Report is green, run full frontend E2E:

```powershell
npm run test:e2e
```

## Do Not Repeat

- Do not rework Engineering data, Equipment, Knowledge, or Purchase unless new evidence proves regression.
- Do not run full E2E repeatedly without first closing the current red cluster.
- Do not kill unrelated user `node.exe` or browser processes.
- Do not broad-format or broad-stage the dirty worktree.

## Success Criteria For Unsealing

- Report focused failure has a proven root cause.
- Report suite is green.
- Full frontend E2E has a clean final result or a newly documented next red cluster.
- Changelog, review, todo, and report docs are updated for every material change.
