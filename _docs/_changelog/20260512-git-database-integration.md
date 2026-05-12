# Git 初始化 + 数据库脚本 + 前后端集成

## Git 仓库
- 初始化 git 仓库（v1/），创建 `.gitignore`
- 首次提交包含完整 Phase 1-2 全部代码
- 后续提交：数据库脚本

## 前后端集成
- `Program.cs` — 添加 `/scheduling` SPA fallback 路由
- `MES.Api.csproj` — 添加构建后自动复制前端文件到 wwwroot
- `frontend/vite.config.ts` — 设置 base: /scheduling/

一键启动: `dotnet run` + 访问 `http://localhost:5000/scheduling`

## 数据库脚本
- `database/init.sql` — 完整 DDL（由 EF Core 迁移生成）
- `database/seed.sql` — 演示数据（8设备 / 12物料 / 3 BOM / 3 工艺路线 / 10 工单 / 排产计划 / 质检 / 异常 / 维护记录）
- `database/README.md` — 使用说明

## 提交记录
- `78e2607` — 仓库初始化（全部 Phase 1-2 代码）
- `8a9398e` — 数据库脚本 + 种子数据
