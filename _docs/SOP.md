# AIMes V1 生产运行 SOP

> 版本: 1.0 | 最后更新: 2026-05-14

---

## 系统概览

### 组件

| 组件 | 容器 | 端口 | 健康检查 |
|------|------|------|----------|
| API (ASP.NET Core) | aimes-api | 5000 | `/health`, `/healthz/secured` |
| PostgreSQL 16 | aimes-pg | 5432 | `pg_isready` |
| Redis 7 | aimes-redis | 6379 | `redis-cli ping` |
| RabbitMQ 4 | aimes-rabbitmq | 5672/15672 | `rabbitmqctl status` |
| Qdrant | aimes-qdrant | 6333/6334 | `/health` |

### 数据卷

- `pgdata` — PostgreSQL 数据文件
- `redisdata` — Redis 持久化快照
- `rabbitmqdata` — RabbitMQ 消息存储
- `qdrantdata` — Qdrant 向量索引

### 目录结构

```
v1/
├── docker-compose.yml        # 容器编排
├── Dockerfile                # API 镜像构建（含前端编译）
├── db/
│   ├── init.sql              # 建库建表
│   └── seed.sql              # 演示种子数据
├── _docs/SOP.md              # 本文档
├── src/
│   ├── backend/
│   │   ├── MES.Api/          # ASP.NET Core 入口
│   │   ├── MES.Application/  # 应用服务
│   │   ├── MES.Domain/       # 领域模型 + 接口
│   │   ├── MES.Infrastructure/# 基础设施（EF Core, 仓储）
│   │   └── MES.AI/           # AI 排产 Agent
│   ├── frontend/             # Vue 3 + Vite 前端
│   └── tests/                # 单元/集成/评估/基准测试
└── AIMes.slnx                # 解决方案
```

---

## 1. 部署 SOP

### 1.1 首次部署

```bash
# 1. 克隆代码
git clone <repo-url> && cd v1

# 2. 配置生产环境变量
# 编辑 docker-compose.yml 或 .env 文件:
#   - Jwt:SigningKey → 强随机密钥（至少 32 字符）
#   - AI:Llm:Provider → AzureOpenAI / OpenAI
#   - ConnectionStrings:* → 生产连接串

# 3. 启动全部服务
docker compose up -d

# 4. 验证启动
docker compose logs -f api   # 等待 "Now listening on http://[::]:5000"
curl -s http://localhost:5000/health | jq .
# 预期: {"status":"Healthy", ...}

# 5. 验证前端
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/scheduling/
# 预期: 200
```

### 1.2 日常部署（代码更新）

```bash
# 1. 拉取最新代码
git pull

# 2. 重建 API 镜像
docker compose build api

# 3. 滚动重启
docker compose up -d api

# 4. 验证
curl -s http://localhost:5000/health
```

### 1.3 数据库迁移

EF Core 迁移在 API 启动时自动执行（`Program.cs:318`）。如需手动管理：

```bash
# 生成迁移
dotnet ef migrations add MigrationName \
  --project src/backend/MES.Infrastructure \
  --startup-project src/backend/MES.Api

# 手动应用
dotnet ef database update \
  --project src/backend/MES.Infrastructure \
  --startup-project src/backend/MES.Api
```

---

## 2. 数据库备份与恢复

### 2.1 备份

```bash
# 全量备份
docker exec aimes-pg pg_dump -U postgres -d mes \
  --file=/tmp/mes-$(date +%Y%m%d%H%M).sql \
  --format=custom

# 从容器复制到宿主机
docker cp aimes-pg:/tmp/mes-*.sql ./backups/

# 清理 7 天前的备份
find ./backups -name "mes-*.sql" -mtime +7 -delete
```

### 2.2 恢复

```bash
# 1. 停止 API 连接
docker compose stop api

# 2. 恢复数据库
docker exec -i aimes-pg pg_restore -U postgres -d mes \
  --clean --if-exists < ./backups/mes-202605141200.sql

# 3. 重启 API
docker compose start api

# 4. 验证数据完整性
curl -s http://localhost:5000/health
```

---

## 3. 回滚 SOP

### 3.1 容器回滚

```bash
# 1. 回滚到上一版本
# 如果使用 CI/CD，直接部署上一版本镜像
# 手动操作:
docker compose up -d api --pull=missing
```

### 3.2 数据库回滚

```bash
# 1. 回滚迁移到上一个版本
dotnet ef database update PreviousMigrationName \
  --project src/backend/MES.Infrastructure \
  --startup-project src/backend/MES.Api

# 2. 如果无向下兼容迁移，使用备份恢复（见 2.2）
```

### 3.3 快速回退（前端 SPA）

```bash
# 前端无状态 — 只需回退 wwwroot
# 保留上一版构建产物
cp -r wwwroot/scheduling wwwroot/scheduling.new
# 确认新版本有问题后
mv wwwroot/scheduling wwwroot/scheduling-bad
mv wwwroot/scheduling.backup wwwroot/scheduling
```

---

## 4. 监控与告警

### 4.1 健康检查端点

| 端点 | 鉴权 | 用途 |
|------|------|------|
| `GET /health` | 无 | 负载均衡探针（基础检查） |
| `GET /healthz/secured` | Admin | 全量健康检查（含 DB/Redis） |

### 4.2 关键指标（OpenTelemetry）

| 指标 | 来源 | 告警阈值 |
|------|------|----------|
| HTTP 请求 P99 延迟 | ASP.NET Core | > 3s |
| 排产 API 响应时间 | `MES.Scheduling` meter | > 5s |
| 数据库连接数 | Npgsql | > 80% 池上限 |
| 排产准时交付率 | `MES.Scheduling` meter | < 60% |
| 设备利用率 | `MES.Scheduling` meter | > 95%（瓶颈告警） |

### 4.3 日志

- 格式: `[HH:mm:ss LVL] {TraceId} {UserId} {Message}`
- 容器: `docker compose logs -f [service]`
- 持久化: 生产环境建议配置 Serilog 写入文件或 Seq

```bash
# 查看实时日志
docker compose logs -f api

# 查看最近 N 行
docker compose logs --tail=200 api

# 按服务过滤错误
docker compose logs api | grep -i "error\|critical\|fail"
```

---

## 5. 故障排查

### 5.1 API 无法启动

**症状**: 容器不断重启

**检查步骤**:
1. 查看日志: `docker compose logs api --tail=50`
2. 检查数据库连接: `docker exec aimes-pg pg_isready -U postgres`
3. 验证配置: `docker exec aimes-api env | grep ConnectionStrings`

**常见原因**:
- 数据库未就绪（`depends_on` 仅检查健康，数据表可能尚未创建）
- JWT SigningKey 为空（生产环境会抛出 `InvalidOperationException`）
- 端口 5000 被占用

### 5.2 数据库连接失败

```bash
# 检查 PostgreSQL 状态
docker exec aimes-pg pg_isready -U postgres

# 检查连接池耗尽
docker compose logs api | grep "Npgsql.NpgsqlException"
```

### 5.3 排产异常

```bash
# 1. 检查 AI 服务日志
docker compose logs api | grep -i "scheduling\|SchedulingAgent\|llm"

# 2. 检查响应中的诊断字段:
#   - warnings: 物料短缺等非致命警告
#   - skippedOrderIds: 因约束跳过的工单
#   - optimizationNotes: LLM/规则引擎决策说明

# 3. 验证 LLM 配置
curl -s http://localhost:5000/health | jq '.entries.llm'
```

### 5.4 前端白屏 / SPA 路由 404

```bash
# 1. 确认前端已构建
docker exec aimes-api ls -la /app/wwwroot/scheduling/index.html

# 2. 验证静态文件中间件
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/scheduling/

# 3. 确认 SPA fallback 路由 (预期 200)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/scheduling/some-deep-route
```

---

## 6. 安全配置

### 6.1 生产环境必须修改

| 配置项 | 默认值 | 生产要求 |
|--------|--------|----------|
| `Jwt:SigningKey` | 开发密钥 | 至少 32 字符随机字符串 |
| `ConnectionStrings:DefaultConnection` | postgres/postgres | 强密码 + 专用用户 |
| `AI:Llm:AzureOpenAI:ApiKey` | (空) | 有效 API 密钥 |
| `AI:Llm:OpenAI:ApiKey` | (空) | 有效 API 密钥 |

### 6.2 速率限制

- 登录 API: 每 IP 每分钟 10 次（`FixedWindowLimiter`）

### 6.3 Token 管理

- Access Token 过期后由 `Jwt:ExpiresInMinutes` 控制
- 黑名单存储在 `TokenBlacklistService`（内存 + Redis 后备）
- 密钥轮转由 `SigningKeyStore` 管理

---

## 7. 性能参考

### 7.1 启动时间

| 组件 | 首次启动 | 热启动 |
|------|----------|--------|
| API (含 EF 迁移) | ~15s | ~5s |
| PostgreSQL | ~10s | ~3s |
| 前端构建 (CI) | ~30s | ~10s |

### 7.2 排产性能

| 工单数 | 规则引擎 | 规则引擎 + LLM |
|--------|----------|----------------|
| 50     | <200ms   | <5s            |
| 100    | <500ms   | <10s           |
| 200    | <1.5s    | <20s           |

### 7.3 资源占用

| 容器 | CPU (基准) | 内存 (基准) |
|------|------------|-------------|
| aimes-api | 0.2 core | 256 MB |
| aimes-pg | 0.3 core | 512 MB |
| aimes-redis | 0.1 core | 128 MB |
| aimes-rabbitmq | 0.2 core | 256 MB |
| aimes-qdrant | 0.3 core | 512 MB |

---

## 8. 快速参考

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 停止并删除数据卷 (警告: 删除所有持久化数据)
docker compose down -v

# 重启单个服务
docker compose restart api

# 重建单个服务
docker compose build api && docker compose up -d api

# 查看日志
docker compose logs -f api

# 进入容器
docker exec -it aimes-api sh
docker exec -it aimes-pg psql -U postgres -d mes

# 查看全部容器状态
docker compose ps

# 健康检查
curl -s http://localhost:5000/health | jq .
```
