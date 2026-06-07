# Issue：Hosted CI hosted runner run 失败

## 状态

GitHub Actions 已经触发真实 hosted runner run，但 CI run `27084449100` 结论为 `failure`，Hosted CI release gate 不能关闭。

## 证据

- RunUrl: `https://github.com/zenweb/AIMes/actions/runs/27084449100`
- RunId: `27084449100`
- Workflow: `CI`
- HeadSha: `50c49cd4250570f1ca5903eef22b29014dd836b4`
- `gh run view`：`status=completed`，`conclusion=failure`
- 失败摘要：backend Restore、frontend Install dependencies、security NuGet dependency audit。

## 风险

如果 release gate 只检查 RunUrl/RunId 是否存在，而不检查 Actions conclusion，就会把失败 hosted CI 误判为可发布。当前脚本已硬化为必须 success。
