# Review: Hosted CI second run fixes

## 结论

本轮修复的是 Hosted CI 第二轮真实 runner 暴露的问题，不是本地推断。Agent Evaluation 已通过；CI 失败不再是旧 `/v1` 路径问题，而是 npm lock 兼容性与集成测试外部依赖隔离不足。

## 根因

- `package-lock.json` 由本地 npm 11 可接受，但 GitHub Actions Node 22 搭配 npm 10 会要求 lockfile 包含 `@emnapi/core@1.10.0` 与 `@emnapi/runtime@1.10.0`。
- 集成测试工厂只切换了数据库到 InMemory，但仍从 `appsettings.json` 继承 `ConnectionStrings:Redis` 与 `ConnectionStrings:RabbitMQ`，导致 hosted runner 上登录路径和综合 `/health` 触发外部依赖失败。

## 风险检查

- 测试环境关闭 Redis/RabbitMQ 是隔离测试依赖，不改变生产配置。
- 生产/staging 仍应通过真实 PostgreSQL、health endpoints、security signoff 和灰度观察关闭 release gate。
- Hosted CI PASS 尚未取得，不能标记发布门禁完成。
