# 2026-06-20 Hosted CI Current Head Repair

## Changed
- 修复当前 `V1` head 上 GitHub CI 后端/Agent Evaluation 的 RabbitMQ health check 编译失败。
- 使用 `npm@10.9.8` 重新同步 `src/frontend/package-lock.json`，补齐 Linux CI 解析出的 `@emnapi/core` 与 `@emnapi/runtime` 锁文件项。
- 保留员工 live 登录修复：普通登录会清理历史 offline demo 状态，避免 `/api/v1/employee` 被本地 demo 模式跳过。

## Evidence
- `dotnet build src/backend/AIMes.slnx --no-restore /p:SkipFrontendBuildCopy=true --nologo --verbosity quiet --property:WarningLevel=0 --consoleloggerparameters:ErrorsOnly`
- `npm exec --yes --package=npm@10.9.8 -- npm ci --registry=https://registry.npmjs.org`
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`

## Notes
- 这是 hosted CI 当前 head 修复，不等同于严格 v1.0.0 最终发布 PASS；灰度 14 天观察仍是最终发布墙钟门槛。
