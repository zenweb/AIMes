# 2026-06-19 Issue - Audit Replay Needed Operator Guidance Links

## Problem
- The audit replay panel exposed many decision chains and object links, but lacked a page-level bilingual prompt for what operators must verify before trusting a replay.
- The configuration approval lane existed, but there was no direct contextual anchor from the replay guidance area.

## Impact
- Operators could review a replay without an explicit reminder to check decision object, actor, evidence id, risk wording, and audit state.
- Configuration approval context was discoverable only by scanning the page.

## Resolution
- Added `#audit-replay-help` guidance with Simplified Chinese and English text.
- Added links to Production, Reports, Config Approvals, and Help.
- Added `aria-describedby="audit-replay-help"` to the selected replay detail region.
- Added `#audit-config-approvals` to the approval lane.

## Status
- Resolved for the audit replay panel.
- Verified by RED/GREEN unit test, full audit replay suite, full frontend coverage, lint, build, and real browser screenshot.
