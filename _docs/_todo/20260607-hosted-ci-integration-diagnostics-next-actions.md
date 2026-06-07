# Todo: Hosted CI integration diagnostics next actions

## 下一步

- 提交并 push integration diagnostics。
- 等待新的 CI run。
- 如果 backend integration 仍失败，读取 `gh run view --log-failed` 中新增的 response body。
- 基于 response body 做单点修复，并重新验证 hosted CI。

## 禁止动作

- 不要继续猜测 Auth 500 根因。
- 不要跳过 backend integration tests。
- 不要关闭 Hosted CI release gate，除非 CI workflow conclusion 为 success。
