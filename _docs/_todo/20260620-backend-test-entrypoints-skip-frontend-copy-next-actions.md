# Todo: 后端测试入口 SkipFrontendBuildCopy 后续

## 已完成
- [x] CI 后端 Architecture / Unit / Integration 测试入口带 `/p:SkipFrontendBuildCopy=true`。
- [x] Attack Chain 自动证据脚本后端测试入口带 `/p:SkipFrontendBuildCopy=true`。
- [x] Security self-assessment 后端测试入口带 `/p:SkipFrontendBuildCopy=true`。
- [x] 架构测试防回退。
- [x] 代表性 integration/unit 命令验证通过。

## 后续建议
- [ ] 下一次 hosted CI 运行后，确认远端 TestResults 正常上传。
- [ ] 若其他本地脚本新增后端 `dotnet test`，同步使用 `/p:SkipFrontendBuildCopy=true`。
- [ ] 继续补 Docker/PostgreSQL live readback 证据。
