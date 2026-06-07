# 2026-05-31 Sprint 3 H22 Dockerfile 加固 Issue

## 已处理问题

- Dockerfile 使用浮动 tag，无法审计基础镜像漂移。
- runtime stage 未显式切换非 root 用户。
- `COPY . .` 在 restore 前执行，导致 NuGet restore 缓存层容易失效。
- 缺少 `.dockerignore`，构建上下文可能包含 `.git`、`bin/obj`、前端 `node_modules`、Nuxt 临时输出和 API 静态产物。

## 剩余限制

- 当前环境无法连接 Docker Hub registry/token 服务，且没有 Docker CLI，因此未做真实容器构建。
- H22 先用架构门锁住可静态验证的要求；后续 H20 CI 合并时应把 `docker build` 纳入具备 Docker 的 CI runner。
