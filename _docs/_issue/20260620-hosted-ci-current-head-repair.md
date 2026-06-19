# 2026-06-20 Issue - Hosted CI Current Head Repair

## Symptom
- GitHub CI run `27845060646`：
  - `frontend` job 在 `npm ci` 失败。
  - `backend` job 在 `dotnet build` 失败。
- Agent Evaluation run `27845060645` 在 build 阶段失败。

## Root Cause
- `Program.cs` 使用 `healthChecks.AddRabbitMQ(string, ...)`，但当前 `AspNetCore.HealthChecks.Rabbitmq` 版本对应签名要求连接工厂。
- `package-lock.json` 缺少 `npm@10.9.8` 在 CI 环境解析出的 peer dependency entries：`@emnapi/core@1.11.1` 和 `@emnapi/runtime@1.11.1`。

## Fix
- RabbitMQ health check 使用懒加载 `IConnection` factory，并将 `rabbitmq://` scheme 转换为 `amqp://`。
- 使用 `npm@10.9.8 npm install --package-lock-only` 同步 lockfile，然后用同版 `npm ci` 验证。

## Verification
- 本地后端 solution build 通过。
- 本地 `npm@10.9.8 ci` 通过。
