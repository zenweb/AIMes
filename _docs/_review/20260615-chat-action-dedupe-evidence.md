# 2026-06-15 Review: chat action dedupe evidence

## Result
- Pass. ChatPanel keeps overlapping engineering navigation suggestions concise and avoids duplicate user actions.

## Evidence
- The prompt `打开工程约束排产和 BOM 工艺路线` triggers both direct navigation matching and engineering constraint action groups.
- Rendered action labels contain exactly one `打开 AI 排产`, one `打开 BOM 管理`, and one `打开工艺路线`.
- No production code change was required; existing `dedupeActions` behavior already satisfied the expectation.

## Residual Risk
- This is unit evidence, not a real browser slice.
- ChatPanel remains a low-coverage user-critical component, so future work should target full user outcomes rather than cosmetic branches.
