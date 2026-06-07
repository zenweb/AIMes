# Todo：Release Gate Latest Audit 下一步

## 必须关闭的硬门禁

- Hosted CI：需要 GitHub remote 指向真实 GitHub 仓库，并取得 hosted runner `RunUrl`、`RunId`、job summary。
- PostgreSQL/staging：需要修复 Docker Desktop HTTPS proxy、registry mirror，或预拉取 `postgres:16-alpine` 等依赖镜像后重跑 staging rehearsal。
- Attack Chain A/B/C：需要真实验证人、`VerifiedAt` 和 A/B/C 三条非占位证据。
- Security signoff：需要 human signer 在人工 Attack Chain PASS 后签字，状态改为 `SIGNED`。
- Gray observation：需要首次灰度发布，并完成 14 calendar days P0/P1=0 观察窗口。

## 不建议继续做的事

- 不建议反复重跑 Docker pull，当前阻塞仍是镜像拉取/代理/镜像源问题。
- 不建议用本地安全自评或 Chromium 证据替代 hosted CI、staging 或人工签字。
- 不建议继续大量切前端微路径来宣称 v1.0.0 ready。

## 可继续推进的低风险动作

- 环境修好后重跑 staging rehearsal。
- GitHub remote 修好后重跑 hosted CI evidence。
- 人工验证信息齐备后运行 `scripts/run-attack-chain-verification.ps1`。
