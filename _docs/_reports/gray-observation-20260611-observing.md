# Gray observation

- GeneratedAt: 2026-06-13T21:38:11.5447623+08:00
- Status: OBSERVING
- GrayReleaseId: gray-v1.0.0-20260613-001
- GrayStartedAt: 2026-06-13T21:38:09+08:00
- ObservationStartedAt: 2026-06-13T21:38:09+08:00
- ObservationEndedAt: 
- Required observation window: 14 calendar days
- P0/P1 incident counts: P0=-1; P1=-1
- Evidence: 已执行灰度部署脚本，生产环境5%流量切至v1.0.0，部署审批单#20260613-001，监控初始无异常
- SecuritySignoffPath: _docs/_review/20260607-security-signoff.md

## Gate

- First gray release: required before v1.0.0.
- Observation window: 2 weeks with no P0/P1 incidents.
- Result: FAIL

## Violations

- Gray observation is still running.

This report cannot close the v1.0.0 release gate.
