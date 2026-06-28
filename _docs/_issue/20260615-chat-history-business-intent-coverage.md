# 2026-06-15 Issue: ChatPanel below coverage leverage threshold

Issue:
- ChatPanel was still below the 80% focused line coverage threshold despite being a user-critical assistant entry point.
- Existing tests were heavy on action-package success paths but lighter on basic conversation reliability and offline business-intent guidance.

Impact:
- History restore regressions, empty prompt guards, loading duplicate-send guards, and RAG-unavailable business fallback paths could regress without focused evidence.
- Continuing to polish already-cleared components would provide lower release-readiness leverage.

Resolution:
- Added targeted ChatPanel unit coverage for history restoration, send guards, BOM kitting guidance, engineering/route actions, top rush-order risks, and anomaly dispatch fail-loud guidance.
- Verified focused ChatPanel coverage now reaches statements 83.85%, functions 83.76%, lines 84.32%.

Status:
- Resolved for this slice.
- Real-browser assistant evidence and gray observation remain separate tracks.
