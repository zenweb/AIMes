# 2026-06-05 Attack Chain Automated Evidence

## Change

- 新增 `scripts/run-attack-chain-automated-evidence.ps1`，将现有测试按 Attack Chain A/B/C 聚合成自动支撑证据报告。
- 新增 `_docs/_reports/attack-chain-automated-evidence-20260605.md`。
- 更新 `_docs/_review/20260605-security-signoff.md`，引用 Attack Chain 自动支撑证据。

## Validation

- PowerShell parser：`scripts/run-attack-chain-automated-evidence.ps1` parse ok。
- `scripts/run-attack-chain-automated-evidence.ps1 -ReportPath _docs/_reports/attack-chain-automated-evidence-20260605.md`：`Result: PASS`。
- 自动支撑证据覆盖：
  - Attack Chain A endpoint authorization：`5 passed`。
  - Attack Chain A agent role matrix：`37 passed`。
  - Attack Chain B credential/token leakage controls：`3 passed`。
  - Attack Chain C release security configuration gates：`4 passed`。
- `scripts/run-release-gate-audit.ps1 ... -ReportPath _docs/_reports/release-gate-audit-20260605.md`：仍为 `Result: FAIL`。

## Release Boundary

- 本报告只减少人工 verifier 的证据整理成本。
- 它不替代 `run-attack-chain-verification.ps1` 所需的 verifier、VerifiedAt 和 A/B/C 人工 evidence。
- Security signoff 仍为 `UNSIGNED`。
