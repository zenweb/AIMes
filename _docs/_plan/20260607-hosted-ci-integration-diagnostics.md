# Plan: Hosted CI integration diagnostics

## 成功标准

- 失败的 Auth/Health integration assertions 会输出 response body。
- 本地相关测试继续通过。
- 下一轮 hosted runner 日志能提供可行动的 500/503 细节。

## 执行

1. 下载并检查 CI run `27085892067` artifact/TRX。
2. 确认缺少 response body。
3. 在失败断言前写出 response body。
4. 本地验证相关 tests 和 format。
5. push 后读取新 hosted CI 结果。

## 停止条件

下一轮 CI 若仍失败，只按新增日志定位根因；若 success，再生成 Hosted CI success evidence。
