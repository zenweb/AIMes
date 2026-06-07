# V1.5 Capability: 5-Minute Demo Asset Bundle

## Scope

- Recording script: `_docs/_marketing/demo-5min-v15-script.md` (current real numbers from `latest-ab-report.json`).
- Subtitles: `_docs/_marketing/demo-5min-v15.srt` (mirrors script narration, 5 cues for 5 shots).
- Storyboard screenshots: `_docs/_marketing/demo-screenshots/01..05*.png` (1440×900 full-page shots).
- Screenshot regenerator: `src/frontend/tests/e2e/demo-asset-capture.spec.ts` (Playwright spec).
- Live data pipeline driving every percentage in the script: `scripts/run-ab-comparison.ps1` → `latest-ab-report.json` → frontend Dashboard/Report.
- Final mp4: **NOT in this branch** (no recorder/ffmpeg locally; record externally with OBS/Loom using script + screenshots as canonical source).

## Honesty rules baked into the asset bundle

1. Every percentage in script and srt comes from the latest .NET runner output (`+3.33 pts, p=0.7745, not significant @ 95%`; Monte Carlo mean `+7.67 pts`), not from PowerShell-hardcoded marketing fiction.
2. The "not significant" disclosure is in the narration itself, not buried in a footnote.
3. Screenshots are regenerable by spec — every change to `latest-ab-report.json` requires rerunning the spec to refresh storyboard alignment.
4. The script has a versioning rule: when seed/dataset/Monte Carlo changes, bump the "Current verified data point" section before recording a new mp4.

## How to produce the mp4 (external step)

```powershell
# 1. Regenerate the A/B report to ensure dashboard hero shows current numbers
powershell -ExecutionPolicy Bypass -NoProfile -File scripts\run-ab-comparison.ps1

# 2. Build frontend so preview consumes the latest report
cd src/frontend
npm run build

# 3. Refresh storyboard screenshots
npm run test:e2e -- demo-asset-capture.spec.ts

# 4. Start preview, login as admin/admin123, navigate the 5 shots
node ./scripts/preview.mjs
# Visit http://localhost:4173/scheduling/dashboard

# 5. Record with OBS / Loom / ScreenToGif following demo-5min-v15-script.md
# 6. Save as _docs/_marketing/demo-5min-v15.mp4 with the .srt sidecar
```

## Verification (this branch)

- `npm run test:e2e -- demo-asset-capture.spec.ts`: **5/5 passed** (1.1m, includes Dashboard/Report assertions against `latest-ab-report.json`)
- 5 screenshots verified at 1440×900, full-page, total 691KB
- Script + srt updated to current real numbers; retired stale OTD values do not leak into narration

## Remaining product work

- External recording session to produce `demo-5min-v15.mp4` (~5 min, voice-over)
- After the mp4 is recorded, post a one-line confirmation in `_docs/_changelog/` with the file size + duration + checksum
