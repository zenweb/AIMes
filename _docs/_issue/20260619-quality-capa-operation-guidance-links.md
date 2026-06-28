# 2026-06-19 Issue - Quality CAPA Complex Operations Needed Guidance Links

## Problem
- The CAPA reuse draft area exposed complex operations that update quality knowledge, audit evidence, and future recommendation ranking.
- Before this slice, the action area had business description text, but no explicit bilingual operation prompt, contextual evidence/audit links, or clickable help affordance at the point of action.

## Impact
- Operators could approve or verify CAPA reuse without a clear reminder of downstream writeback effects.
- Related trace and audit ids were present but not presented as navigable contextual anchors.

## Resolution
- Added `#quality-capa-operation-help` guidance with Simplified Chinese and English text.
- Added links to the reuse draft trace anchor, audit anchor, and local help anchor.
- Added `aria-describedby` from `.formal-capa-flow` to the guidance block.

## Status
- Resolved for the reuse-draft CAPA operation area.
- Verified by unit tests, full frontend coverage, lint, build, and real browser screenshot.
