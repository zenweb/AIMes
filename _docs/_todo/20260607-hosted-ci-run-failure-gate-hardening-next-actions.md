# Todo：Hosted CI run failure gate hardening next actions

## 下一步

- 先修 GitHub Actions `CI` run `27084449100` 的失败项：
  - backend `Restore`
  - frontend `Install dependencies`
  - security `NuGet dependency audit`
- 修复后重新 push 到 GitHub `main`，等待新 hosted runner run 完成。
- 用新的成功 run 重新运行 `scripts/run-hosted-ci-evidence.ps1`。
- 再运行 `scripts/run-release-gate-audit.ps1`，确认 Hosted CI gate 从 FAIL 变为 PASS。

## 禁止动作

- 不要把 `conclusion=failure` 的 Actions run 写成 PASS。
- 不要用本地 build/test 代替 hosted runner evidence。
- 不要继续切前端微测试来假装 B-track 发布门禁在推进。
