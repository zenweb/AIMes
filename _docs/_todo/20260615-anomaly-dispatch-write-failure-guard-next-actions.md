# 2026-06-15 Anomaly dispatch write failure guard next actions

- Keep hardening `AnomalyBoard` by targeting remaining uncovered high-value paths before broadening scope.
- Candidate next slice: thrown `writeAnomalyDispatchRecord` exception should leave the lane retryable and show the exception-derived fail-loud message.
- Candidate next slice: production anomaly backend event should be inserted at the top of the list and opened with its backend-derived detail.
- Do not add new anomaly features until routing correctness, recovery, and evidence paths are covered.
