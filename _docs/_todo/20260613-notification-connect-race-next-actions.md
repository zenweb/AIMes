# 2026-06-13 TODO: Notification connect race next actions

- Continue improving existing-feature quality by coverage increment times user-criticality.
- Candidate notification follow-up: cover active-generation `onreconnecting`, `onreconnected`, and `onclose` behavior if the next coverage route still points to the notification store.
- Candidate broader route: refresh full frontend coverage and move to the next low-coverage user-critical existing path once notification connection recovery remains stable.
- If continuing notification hardening, prefer active lifecycle behavior over more stale-callback variants; stale start, reconnect, lifecycle, and offline transition are already covered.
- Keep gray observation excluded from the active wait path unless the owner asks to resume the 15-day window.
