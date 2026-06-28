# 2026-06-14 Todo - Report CSV Keeps Evidence Load Fail Loud

## Done
- Added a unit regression proving report evidence-load failures remain visible after successful CSV export.
- Added a real Chromium regression for the same CSV-after-failure user path.
- Verified the full ReportBoard unit suite, full ReportBoard Chromium suite, and frontend coverage suite.

## Next Actions
- Continue boutique hardening on existing user-critical components using coverage increment and real-browser evidence as routing signals.
- Prefer the next lowest-coverage, high-traffic board over further LoginPage refinement.
- Track the existing `--localstorage-file` warning separately instead of folding it into this ReportBoard slice.

