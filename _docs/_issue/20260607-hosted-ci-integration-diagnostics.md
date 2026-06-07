# Issue: Hosted CI backend integration failure lacks response body

## 状态

待下一轮 hosted runner 复验。当前已补测试诊断输出。

## 证据

- CI run `27085892067`:
  - `security`: success
  - `frontend`: success
  - `backend`: failure at Integration Tests
- 失败测试仍集中在 Auth login/change-password 与 `/health`。
- TRX 与 `gh run view --log-failed` 只包含断言栈，不包含 API problem details。

## 影响

没有 response body 时，继续修改容易变成猜测。需要先让 hosted runner 暴露真实异常内容。
