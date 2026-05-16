# MES 数据库

## 文件说明

| 文件 | 说明 |
|------|------|
| `seed.sql` | 演示种子数据（设备、物料、BOM、工艺路线、工单、排产计划等），仅供 docker compose 评估场景使用 |

> **注**：schema 由 EF Core Migrations 唯一管理，不再维护单独的 DDL 脚本（`db/init.sql` 已删除以避免双轨漂移）。
> 如需 DBA 手动建库，请用 `dotnet ef migrations script` 导出当前 SQL。

## 使用方法

### 开发环境（EF Core 自动迁移）

```bash
dotnet ef database update --project src/backend/MES.Infrastructure --startup-project src/backend/MES.Api
```

### 手动初始化（给 DBA 或非 .NET 环境）

```bash
# 1. 创建数据库
createdb mes

# 2. 用 EF 工具导出最新 schema（替代旧的 init.sql）
dotnet ef migrations script --project src/backend/MES.Infrastructure --startup-project src/backend/MES.Api -o /tmp/aimes-schema.sql
psql -d mes -f /tmp/aimes-schema.sql

# 3. 导入演示种子数据（可选）
psql -d mes -f db/seed.sql
```

### Docker 环境

```bash
docker compose up -d
# API 启动时自动 MigrateAsync 建表；docker-compose.yml 仅挂 seed.sql 灌演示数据。
```

