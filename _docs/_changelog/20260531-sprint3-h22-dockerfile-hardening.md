# 2026-05-31 Sprint 3 H22 Dockerfile 加固

## 变更

- `Dockerfile` 三个构建阶段均改为 digest pin：
  - `mcr.microsoft.com/dotnet/sdk:10.0@sha256:c0790639332692a0d56cdd81ed581cfd24d040d9839764c138994866df89a3b6`
  - `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm@sha256:0d29e5fdc64f8397cd502223e0c4679f1e60877ca0fd2db4f2e2e0028e4271af`
  - `mcr.microsoft.com/dotnet/aspnet:10.0@sha256:8c0b6857eab7b2aa57884c839bf4678414606bd7d17370f18a842ac5cf414711`
- 后端构建改为先复制 `Directory.*`、`AIMes.slnx` 和项目文件执行 `dotnet restore`，再复制源码并 `dotnet publish --no-restore`。
- 前端构建改为先复制 `package.json` / `package-lock.json` 执行 `npm ci`，再复制源码并 `npm run build`。
- runtime stage 增加 `USER $APP_UID`，避免以 root 运行 ASP.NET Core 进程。
- 新增 `.dockerignore`，排除 `.git`、`bin/`、`obj/`、前端 `node_modules` / Nuxt 输出、`src/backend/MES.Api/wwwroot` 等构建上下文噪音。
- 新增 H22 架构门，持续检查 digest pin、非 root runtime、restore 层顺序、`--no-restore` publish 与 `.dockerignore` 必备项。

## 备注

- 本机无 `docker` / `crane` / `skopeo` / `regctl`，未执行真实 `docker build`。
- Microsoft 镜像 digest 来自 MCR registry HEAD；Docker Hub 在当前环境连接超时，因此前端 builder 从 `node:22-alpine` 调整为可通过 MCR 核验 digest 的 `devcontainers/javascript-node:1-22-bookworm`。
