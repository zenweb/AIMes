# 2026-06-13 Plan: 灰度观察收口

## 目标

在 Security signoff 已 PASS 且首次灰度已启动的基础上，推进 v1.0.0 最后一个发布闸门：14 天无 P0/P1 观察。

## 当前证据

- Attack Chain A/B/C verified report：`_docs/_reports/attack-chain-verification-20260611-manual-verified.md`。
- Security signoff：`_docs/_review/20260607-security-signoff.md`。
- Gray observation observing report：`_docs/_reports/gray-observation-20260611-observing.md`。
- Current release gate audit：`_docs/_reports/release-gate-audit-20260613-after-gray-start.md`。

## 成功标准

- 灰度启动报告为 `OBSERVING`，且含真实灰度发布 ID、开始时间和启动证据。当前已满足。
- 至少 14 calendar days 后，灰度报告为 `PASS`。
- P0IncidentCount=0，P1IncidentCount=0。
- final release gate audit 全部 PASS。

## PASS 命令模板

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260627-pass.md `
  -Status PASS `
  -GrayReleaseId "gray-v1.0.0-20260613-001" `
  -GrayStartedAt "2026-06-13T21:38:09+08:00" `
  -ObservationStartedAt "2026-06-13T21:38:09+08:00" `
  -ObservationEndedAt "<ISO timestamp not before 2026-06-27T21:38:09+08:00>" `
  -P0IncidentCount 0 `
  -P1IncidentCount 0 `
  -Evidence "<incident query / monitoring evidence proving P0=0 and P1=0>" `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md
```

## 边界

- 不把 `OBSERVING` 当作 release gate PASS。
- 不用未来时间或占位证据生成灰度 PASS。
