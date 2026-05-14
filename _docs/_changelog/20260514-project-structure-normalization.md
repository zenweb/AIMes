# 目录结构重整

> 仓库布局规范化，统一解决方案、后端、前端、测试与数据库脚本的层级
> 日期: 2026-05-14

---

## 完成项

### 1. 仓库目录重整
- 根目录保留：
  - `AIMes.slnx`
  - `src/`
  - `_docs/`
  - `db/`
- 原 `src/*` 后端项目整体迁移至 `src/backend/`
- 原 `frontend/` 迁移至 `src/frontend/`
- 原 `tests/` 迁移至 `src/tests/`
- 原 `database/` 迁移至 `db/`

### 2. 解决方案文件位置确认
- **解决方案文件位置**: `C:\AIWorks\AIMes\v1\AIMes.slnx`
- 解决方案未放入 `src/`，而是保留在仓库根目录。
- 这是标准的多项目 .NET 仓库布局，便于统一管理后端、前端、测试、文档和基础设施文件。

### 3. 工程与工具链路径同步
- **文件**: `AIMes.slnx`
  - 解决方案项目路径改为：
    - `src/backend/*`
    - `src/tests/*`
- **文件**: `src/backend/MES.Api/MES.Api.csproj`
  - 前端构建产物引用改为新结构下的 `src/frontend/dist`
- **文件**: `Dockerfile`
  - API 发布路径改为 `src/backend/MES.Api`
  - 前端构建上下文改为 `src/frontend`
- **文件**: `docker-compose.yml`
  - 数据库初始化脚本路径改为 `db/init.sql`、`db/seed.sql`
- **文件**: `.github/workflows/ci.yml`
  - 后端测试路径改为 `src/tests/...`
  - 前端工作目录改为 `v1/src/frontend`
- **文件**: `.github/workflows/eval.yml`
  - evaluation 脚本与结果路径改为 `src/tests/MES.Tests.Evaluation`
- **文件**: `.gitignore`
  - 前端输出、Playwright 结果、API 静态产物忽略路径改为新结构

### 4. 文档路径同步
- **文件**: `db/README.md`
  - EF Core、运行命令、SQL 文件路径全部改为新结构
- **文件**: `_docs/SOP.md`
  - 目录树、迁移命令、回滚命令改为新结构

---

## 重构后结构

```text
v1/
├── AIMes.slnx
├── _docs/
├── db/
│   ├── init.sql
│   ├── seed.sql
│   └── README.md
└── src/
    ├── backend/
    │   ├── MES.AI/
    │   ├── MES.Api/
    │   ├── MES.Application/
    │   ├── MES.Domain/
    │   └── MES.Infrastructure/
    ├── frontend/
    └── tests/
```

---

## 验证结果

| 项目 | 状态 |
|------|------|
| `dotnet sln AIMes.slnx list` | ✅ 通过 |
| `dotnet build src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore` | ✅ 通过 |
| `npm run build`（`src/frontend`） | ✅ 通过 |

---

## 说明

- 本次重构是**目录结构规范化**，不是把解决方案文件移动到 `src/`。
- 如果按旧路径去 `src` 下查找 `.sln` / `.slnx`，会找不到；当前正确位置是仓库根目录：
  - `C:\AIWorks\AIMes\v1\AIMes.slnx`
