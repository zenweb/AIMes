# Plan: Hosted CI second run fixes

## 成功标准

- npm 10 能接受前端 lockfile。
- 后端集成测试不依赖 hosted runner 上不存在的 Redis/RabbitMQ/Qdrant。
- 本地关键验证通过后提交并 push。
- 以新的 GitHub Actions CI run 作为最终证据，不用本地结果替代 hosted evidence。

## 执行

1. 用 `gh run view --log-failed` 读取 CI run `27085506748` 失败日志。
2. 用 npm 10 复现 lockfile 失败，并更新 lockfile。
3. 分析 backend integration 500/503，确认测试环境继承外部依赖配置。
4. 最小修改集成测试工厂配置覆盖。
5. 运行本地验证。
6. 推送后等待 hosted runner 复验。

## 停止条件

如果新的 hosted CI run 仍失败，停止扩散功能，只读失败日志并定位下一处真实根因。
