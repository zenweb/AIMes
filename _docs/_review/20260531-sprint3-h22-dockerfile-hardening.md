# 2026-05-31 Sprint 3 H22 Dockerfile 加固 Review

## 结论

- H22 文本架构门已覆盖计划要求：基础镜像 digest pin、runtime 非 root、restore 缓存层、publish `--no-restore`、`.dockerignore`。
- 定向红灯已确认旧 Dockerfile 因未 pin digest 失败；实现后定向测试通过。

## 风险

- 未运行真实 Docker build：当前机器没有 Docker CLI 和常见 registry 工具。
- 前端 builder 镜像从 Alpine 切到 Debian bookworm devcontainer 镜像，主要影响镜像体积和底层包集合，不改变 `npm ci && npm run build` 构建路径。
- `USER $APP_UID` 依赖 Microsoft .NET runtime 镜像提供的非 root 用户变量；这是 .NET 容器镜像的既有约定，但仍建议后续在有 Docker 的环境做一次实际 build/run。

## 已验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H22Dockerfile_ShouldUsePinnedImagesNonRootRuntimeAndCacheFriendlyRestore`
