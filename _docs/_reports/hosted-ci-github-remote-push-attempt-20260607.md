# Hosted CI GitHub remote push attempt

日期：2026-06-07

## 目标

在用户提供 GitHub 仓库 `https://github.com/zenweb/AIMes` 后，推进 Hosted CI 前置条件：添加 GitHub remote、尝试推送当前 HEAD 建立 GitHub 分支，并确认是否触发 GitHub Actions runs。

## 操作

### 保留原 origin，新增 github remote

```text
github  https://github.com/zenweb/AIMes.git (fetch)
github  https://github.com/zenweb/AIMes.git (push)
origin  https://git.code.tencent.com/zenweb/AIMes.git (fetch)
origin  https://git.code.tencent.com/zenweb/AIMes.git (push)
```

### gh auth

```text
Logged in to github.com account zenweb
Git operations protocol: https
Token scopes: gist, read:org, repo, workflow
```

### 当前 HEAD

```text
Branch: V1
HEAD: 50c49cd4250570f1ca5903eef22b29014dd836b4
Commit: 50c49cd Let assistant create BOM kitting packages
```

当前 HEAD 已包含：

```text
ci-in-head: yes
eval-in-head: yes
```

### GitHub repo view

```json
{"defaultBranchRef":{"name":""},"isPrivate":true,"nameWithOwner":"zenweb/AIMes","pushedAt":"2026-06-07T05:42:11Z","url":"https://github.com/zenweb/AIMes"}
```

结论：GitHub 仓库存在，但 default branch 仍为空。

### Push attempt

命令：

```powershell
git push github HEAD:refs/heads/V1
```

输出：

```text
error: RPC failed; curl 55 Send failure: Connection was reset
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
Everything up-to-date
```

### Post-push verification

`git ls-remote --heads github`：

```text
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Failed to connect to github.com port 443 after 21152 ms: Could not connect to server
```

`gh repo view` 仍显示 default branch 为空。

`gh run list --repo zenweb/AIMes --limit 10` 输出为空。

## 结论

- GitHub remote 已添加。
- GitHub CLI 登录可用。
- GitHub 仓库存在。
- 当前 HEAD 包含 workflow 文件。
- 推送未形成可验证的 GitHub branch。
- GitHub Actions runs 仍为空。
- Hosted CI release gate 仍不能关闭。

## 下一步

- 需要在网络稳定后重新推送 `V1` 到 GitHub，或由用户在本地手动推送。
- 远端出现 branch 后，再等待 GitHub Actions run 产生。
- Actions run 完成后，再运行 hosted CI evidence 脚本采集 `RunUrl`、`RunId` 和 job summary。
