# Review: 后端测试入口统一跳过前端静态拷贝

## 结论
- 通过。CI 主线和发布安全证据脚本已经显式传递 `/p:SkipFrontendBuildCopy=true`，并由架构测试防回退。

## 风险检查
- CI 后端测试入口：Architecture / Unit / Integration 均带 skip 开关。
- Attack Chain 自动证据：integration/unit/architecture 测试均带 skip 开关。
- Security self-assessment：unit/integration/architecture 测试均带 skip 开关。
- 代表性命令已验证可执行：Release integration 1 passed，Unit role matrix 37 passed。

## 未覆盖
- 未跑完整 GitHub Actions hosted CI。
- 未跑完整 attack-chain/security 脚本；本片验证了命令入口、架构约束和代表性 dotnet test 参数可用性。
- Docker API 仍不是本片修复范围。
