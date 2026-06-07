# V1.5 5-Minute Demo Screenshots

> Source: Playwright spec `src/frontend/tests/e2e/demo-asset-capture.spec.ts` against the actual V1.5 build (seed `20260523`, dataset `DEMO-OTD-30-202605`).
> Viewport: 1440×900, full-page screenshots.
> Login: admin / admin123.
> Regenerate: `cd src/frontend && npm run test:e2e -- demo-asset-capture.spec.ts`.

| File | Shot | Time | Subject |
|---|---|---|---|
| `01-dashboard-hero.png` | Shot 01 | 00:00-00:45 | Dashboard hero, AI MES Command Center, OTD `26.67% → 30.00%` |
| `02-risk-queue.png` | Shot 02 | 00:45-01:35 | Risk action queue, owned cards with audit trace |
| `03-scheduling-agent.png` | Shot 03 | 01:35-02:45 | Scheduling Agent decision panel, 4 baselines + 1 Agent |
| `04-production-execution.png` | Shot 04 | 02:45-03:45 | Production execution writeback to OTD chain |
| `05-report-center.png` | Shot 05 | 03:45-05:00 | Report center reading `latest-ab-report.json` |

## Numbers integrity

These screenshots are valid only while `src/frontend/public/reports/latest-ab-report.json`
matches the script's "Current verified data point" section. After regenerating the JSON
(seed change, dataset extension, Monte Carlo wired in, etc.), rerun the spec to refresh
this folder.

## Why screenshots, not mp4

Local engineering loop has no recorder/ffmpeg. The mp4 must be produced externally
(OBS / Loom / ScreenToGif) using `demo-5min-v15-script.md` as the canonical source.
These screenshots serve as the storyboard reference for the recording.
