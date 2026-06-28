# 2026-06-19 Review: Quality Barcode Knowledge Guidance Links

## Finding
The barcode quality knowledge reuse panel already let operators publish a CAPA knowledge sample from rework evidence, but the action lacked local bilingual guidance, related evidence links, and a help anchor. This is a complex quality operation because it turns rework/release evidence into reusable CAPA knowledge.

## Change Reviewed
- Added `.barcode-knowledge-guidance` inside the existing barcode quality knowledge panel.
- Guidance is bilingual: Simplified Chinese and English.
- Added `.barcode-knowledge-links` for audit replay, report evidence, and local help.
- No quality archive, release, CAPA, or backend behavior was changed.

## Verification
- RED/GREEN target test confirmed the missing guidance.
- QualityBoard unit suite passed: 30/30.
- Full frontend coverage passed: 111 files / 1091 tests.
- Lint and production build passed.
- Real browser preview confirmed the quality page and the seeded barcode quality knowledge panel render the guidance and links.

## Residual Risk
- Browser evidence used local/offline auth and a seeded `aimes_otd_evidence_chain` record to expose the existing barcode quality gate branch.
- This slice only improves the barcode quality knowledge reuse operation. Other quality panels may still deserve local guidance if a concrete complex-operation gap is confirmed.
- Overall release completion remains unproven while gray observation is deferred/skipped.
