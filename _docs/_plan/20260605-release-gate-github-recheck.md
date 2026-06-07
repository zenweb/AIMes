# 2026-06-05 Release Gate GitHub Recheck Plan

## Success Criteria

- Hosted CI gate 必须有真实 GitHub Actions run URL，格式为 `https://github.com/.../actions/runs/<RunId>`。
- `RunId` 必须是数字，并且必须与 `RunUrl` 末尾一致。
- `gh run list` 必须能在当前 repo 上下文中列出该 run。
- job summary / evidence 不能是 `TBD`、`TODO`、`PENDING`、`待补` 或 `待定`。
- 本地测试、coverage、lint 和 workflow 文件存在不能替代 hosted runner 证据。

## Completed

- 已确认：`gh auth status` 登录 `zenweb`，scope 包含 `repo` / `workflow`。
- 已确认：当前 `origin` 仍是腾讯工蜂 remote。
- 已确认：`gh repo list zenweb --limit 100` 未发现 `zenweb/AIMes`。
- 已生成：`_docs/_reports/hosted-ci-20260605.md`，结果为 `FAIL`。

## Next

- 用户确认 GitHub 仓库名称和可见性，或提供已有 GitHub remote。
- 绑定 GitHub remote 后触发 Actions run。
- 回填 `RunUrl`、`RunId`、job summary，并重新运行 `scripts/run-hosted-ci-evidence.ps1`。
- Hosted CI 单项 PASS 后，再重新运行 release gate 总审计。
