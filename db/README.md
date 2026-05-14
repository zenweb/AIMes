# MES 数据库

## 文件说明

| 文件 | 说明 |
|------|------|
| `init.sql` | 完整 DDL 脚本（由 EF Core 迁移生成），含所有表结构、索引、外键 |
| `seed.sql` | 演示种子数据（设备、物料、BOM、工艺路线、工单、排产计划等） |

## 使用方法

### 开发环境（EF Core 自动迁移）

```bash
dotnet ef database update --project src/backend/MES.Infrastructure --startup-project src/backend/MES.Api
```

### 手动初始化（给 DBA 或非 .NET 环境）

```bash
# 创建数据库
createdb mes

# 初始化表结构
psql -d mes -f db/init.sql

# 导入种子数据
psql -d mes -f db/seed.sql
```

### Docker 环境

```bash
# 启动 PostgreSQL
docker compose up -d db

# 应用迁移（自动建表 + 种子数据）
dotnet run --project src/backend/MES.Api
```
