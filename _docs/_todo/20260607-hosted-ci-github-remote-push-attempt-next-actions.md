# Todo：Hosted CI GitHub remote push next actions

## 下一步

- 网络稳定后重试：

```powershell
git push github HEAD:refs/heads/V1
```

- 推送成功后确认：

```powershell
git ls-remote --heads github
gh repo view zenweb/AIMes --json defaultBranchRef,pushedAt,url
gh run list --repo zenweb/AIMes --limit 10
```

- Actions run 完成后运行 hosted CI evidence 脚本，填入真实 `RunUrl`、`RunId` 和 job summary evidence。

## 禁止动作

- 不要把空 run list 记录为 PASS。
- 不要用本地 workflow 文件存在替代 hosted runner 证据。
- 不要提交或记录用户提供的密码。
