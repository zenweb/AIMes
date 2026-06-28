# 2026-06-19 Issue: Offline demo report evidence technical message leak

## Problem
- Report Center offline demo showed a report evidence alert for an intentionally skipped backend request.
- The visible message included `排产采纳反馈证据加载失败：Offline demo mode skipped backend request: /api/v1/scheduling/adoption-feedback/latest`.

## Impact
- The report page looked partially broken even though local demo reporting content was available.
- Technical implementation details leaked into a customer-facing demo path.

## Resolution
- Report optional evidence loaders now ignore `OfflineDemoApiError` and return their local fallback.
- Latest adoption feedback loading now falls back to local schedule feedback snapshot quietly for offline demo.
- Ordinary backend failures still produce `报表证据加载失败`.

## Evidence
- RED test reproduced the report alert leak.
- GREEN regression passed.
- Real browser confirmed `/scheduling/report?offlineDemo=1` has no backend-skip text and no report evidence alert.
