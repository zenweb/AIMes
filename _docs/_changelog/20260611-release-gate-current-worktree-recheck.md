# 2026-06-11 Release Gate 当前工作树复核

## 背景

当前工作树本地自动化与真实浏览器基线已经复核为绿，但 v1.0.0 发布边界还包含人审和墙钟门。为避免把“本地绿”误报为“可发布”，本片重新运行 release gate 审计。

## 执行

```powershell
./scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260611-current-worktree-recheck.md
```

## 结果

- Hosted CI：PASS
- PostgreSQL/staging：PASS
- Attack Chain A/B/C：FAIL，缺 verifier、VerifiedAt、A/B/C 手工 PASS 与非占位 evidence
- Security signoff：FAIL，仍为 UNSIGNED，且依赖 Attack Chain A/B/C PASS
- Gray observation：FAIL，首次灰度未开始，14 天 P0/P1=0 观察窗口没有证据

## 变更

- 新增 `_docs/_reports/release-gate-audit-20260611-current-worktree-recheck.md`。
- 本片不手改签字、不伪造灰度观察、不把自动化 PASS 外推为 v1.0.0 完成。

