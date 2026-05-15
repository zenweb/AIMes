# 20260514 — Pre-Launch DX 第 1+2 批实施

## 背景

`/plan-devex-review` Pre-Launch 模式产出 [push 前清单](../_plan/20260514-pre-launch-checklist.md)（13 项 + Codex outside voice 发现的 2 项 funnel 杀手 = 15 项）。

本次完成第 0+1+2 批的 12 项，剩 3 项需人工或后续推进。

## Funnel 杀手修复（Codex 发现）

### 0a. Swagger Production 启用

`src/backend/MES.Api/Program.cs:182-189` 增加 `Aimes:EnableSwagger` 配置开关。

`docker-compose.yml:84` 默认 `Aimes__EnableSwagger: "true"`，让评估人 `docker compose up` 后访问 `/swagger` 不再 404。

### 0b. HttpsRedirection 在演示场景关闭

`src/backend/MES.Api/Program.cs:206-213` 增加 `Aimes:DisableHttpsRedirect` 配置。

`docker-compose.yml:85` 默认 `Aimes__DisableHttpsRedirect: "true"`，避免浏览器 `http://localhost:5000` → 307 跳到 `https://localhost:5000` → 连接失败的死路。

## DX 阻塞项实施

### #1 根 `README.md`

新建 `v1/README.md`（按 `working-directory: v1` 的 GitHub Actions 配置约定，v1 是仓库根）：

- 顶部 GitHub badges（License / Version / .NET / Vue）
- 排程甘特图首屏截图引用
- 5 分钟启动指引（git clone / docker compose up / 浏览器打开）
- 5 张产品截图占位表格
- 开源版 vs 商业版边界精简表
- 维护策略段（明确"公司维护，不依赖社区贡献"）

### #3 `Program.cs` 启动横幅

`Program.cs:351-373` 在 `app.Lifetime.ApplicationStarted` 注册横幅打印：

```
╔══════════════════════════════════════════════════════════╗
║  AIMes V1 — 智能 MES 系统（开源版）                       ║
╠══════════════════════════════════════════════════════════╣
║  ✓ 后端就绪：  http://localhost:5000                       ║
║  ✓ 看板入口：  http://localhost:5000/scheduling/           ║
║  ✓ API 文档：  http://localhost:5000/swagger               ║
║  ✓ 健康检查：  http://localhost:5000/health                ║
║                                                          ║
║  默认账号：    admin / admin@123                           ║
║  ⚠️  仅演示用。生产环境请立即修改密码 + 配置 Jwt:SigningKey ║
║                                                          ║
║  💡 商业版（LLM 多目标 Pareto / 自学习 / 私有部署）        ║
║      详见 _docs/commercial-vs-opensource.md               ║
╚══════════════════════════════════════════════════════════╝
```

评估人 `docker compose logs api` 第一眼就看到下一步去哪。

### #4 根路径 `/` 跳转

`Program.cs:243` `app.MapGet("/", () => Results.Redirect("/scheduling/"))`。

消除"评估人猜路径"摩擦点（empathy narrative T+2:00）。

### #6 LICENSE

新建 `v1/LICENSE`，完整 Apache-2.0 文本，版权人 `Copyright 2026 AIMes Contributors`。

### #7 CHANGELOG.md

新建 `v1/CHANGELOG.md`，按 [Keep a Changelog](https://keepachangelog.com/) 格式：

- `[Unreleased]`：本次 Pre-Launch DX 配套 + OnnxInferenceService 修复
- `[v0.1.0] - 2026-05-14`：首次开源发布完整能力清单（按排程引擎 / 前端 / 业务模块 / 平台 / 基础设施 / 安全 / 测试分组）

### #9 `_docs/quickstart.md`

详细启动指南：先决条件矩阵、3 步启动、第一次访问、5 分钟体验路径、端口表、生产部署提示。

### #10 `_docs/troubleshooting.md`

8 个高频问题：

1. 端口被占
2. PG 容器 unhealthy（内存不足）
3. 首次 db init 报错
4. API 启动后挂掉
5. 浏览器无法访问（HTTPS 重定向问题，本次已修）
6. Swagger 404（本次已修）
7. 看板空白页
8. 登录后甘特图无数据

### #11 `_docs/commercial-vs-opensource.md`

完整功能边界对照表（排程 / 视觉质检 / 知识库 / 部署 / 集成 / 模型版本许可），底部含商业版联系方式（占位待替换为真实信息）+ FAQ。

### #12 内部产物清理脚本

新建 `v1/scripts/pre-launch-cleanup.sh`：

- 用 `git rm --cached` 而非 `git rm`，文件保留磁盘但不再被 GitHub 追踪
- 支持 `--dry-run` 模式预览
- 自动追加 `_docs/_changelog/` `_docs/_review/` `_docs/_research/` `_docs/_plan/` 到 `.gitignore`
- Dry-run 验证：识别 17 个 changelog + 1 个 review + 1 个 research 共 19 个文件

## 仍待补的 3 项

| # | 项 | 状态 | 建议 |
|---|---|---|---|
| 2 | `v1/README.md`（v1 目录下 README） | 已合并到根 README | 如 v1 不是仓库根，再分一份 |
| 5 | 5 张产品截图 + 1 GIF | 需人工 | 起 docker compose 截 |
| 8 | 看板顶部商业版 CTA banner | 需前端改动 | 暂用启动横幅 + README CTA 兜底 |
| 13 | ProblemDetails 错误码 + docUrl | 未做 | 30 min 工作量，可下次推进 |

## 验证

- `dotnet build MES.Api.csproj` → **0 警告 0 错误**
- `bash scripts/pre-launch-cleanup.sh --dry-run` → 正确识别 19 个待清理文件，未误伤对外文档

## 文件清单

新建：
- `v1/README.md`
- `v1/LICENSE`
- `v1/CHANGELOG.md`
- `v1/_docs/quickstart.md`
- `v1/_docs/troubleshooting.md`
- `v1/_docs/commercial-vs-opensource.md`
- `v1/_docs/_plan/20260514-pre-launch-checklist.md`
- `v1/scripts/pre-launch-cleanup.sh`

修改：
- `v1/src/backend/MES.Api/Program.cs`（Swagger 配置 + HTTPS 重定向开关 + 根路径跳转 + 启动横幅）
- `v1/docker-compose.yml`（`Aimes__EnableSwagger` + `Aimes__DisableHttpsRedirect`）

## 下一步建议

1. 起 docker compose 实测 5min TTHW 是否达标
2. 截图 5 张放 `_docs/screenshots/`
3. 替换 `commercial-vs-opensource.md` 底部联系方式占位
4. 跑 `scripts/pre-launch-cleanup.sh`（非 dry-run）
5. 决定 GitHub 仓库根是 `AIMes/` 还是 `AIMes/v1/`
6. push 前先建私仓试 1 次完整流程
