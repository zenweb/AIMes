# 2026-06-15 Next Actions - QualityBoard 成功同步路径覆盖

- Do not continue polishing `QualityBoard` only for marginal coverage; it now clears the 80% branch threshold for this focused slice.
- Next quality slice should use coverage leverage and user-criticality, avoiding already-covered components unless a real defect appears.
- When rerunning PostgreSQL-backed browser evidence, use the restored Docker setup and declare a non-5000 API override such as `http://localhost:5003`.
- Keep new runtime/browser commands off host `localhost:5000`.
