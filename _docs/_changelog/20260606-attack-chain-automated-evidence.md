# 2026-06-06 Attack Chain Automated Evidence

## Changed

- 运行本地自动攻击链支持证据脚本，生成 `_docs/_reports/attack-chain-automated-evidence-20260606.md`。
- 明确自动证据只支持人工 Attack Chain A/B/C 验证，不替代 verifier、VerifiedAt、人类证据和安全签字。

## Verification

- `scripts/run-attack-chain-automated-evidence.ps1 -ReportPath _docs/_reports/attack-chain-automated-evidence-20260606.md`：PASS。
- Attack Chain A endpoint authorization：5/5 passed。
- Attack Chain A agent role matrix：37/37 passed。
- Attack Chain B credential/token leakage controls：3/3 passed。
- Attack Chain C release security configuration gates：4/4 passed。

## Release Gate Impact

- 自动支持证据已补强。
- Attack Chain A/B/C manual verification gate 仍未关闭。
