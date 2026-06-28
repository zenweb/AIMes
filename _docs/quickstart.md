# AIMes V1 — Quickstart

> **目标**：从 git clone 到看到带数据的甘特图，5 分钟内完成。
> **适用读者**：第一次评估 AIMes 的工厂 IT / 工程师。

---

## 0. 先决条件

| 项 | 最低要求 | 备注 |
|---|---|---|
| Docker | Docker Desktop ≥ 4.20（Win/Mac）或 Docker Engine ≥ 24（Linux） | 含 Compose v2 |
| 内存 | 8 GB 可用 | 4 个数据容器 + API |
| 磁盘 | 20 GB 可用 | 镜像 ~3 GB + 数据卷 |
| 端口 | 5003 / 5432 / 6379 / 5672 / 6333 / 15672 | 见下方端口表；API 宿主机端口可覆盖 |
| 浏览器 | Chrome / Edge ≥ 100 | 仅看板需要 |

不需要：.NET SDK / Node.js / 任何编译工具链。**全部容器化运行**。

---

## 1. 三步启动

```bash
git clone https://github.com/YOUR_ORG/aimes.git
cd aimes/v1
docker compose up -d
```

首次启动会拉镜像，约 3-5 分钟（取决于网速）。等待所有容器变成 `healthy`：

```bash
docker compose ps
# 期望看到 5 个服务都是 (healthy)：
#   aimes-pg       postgres:16-alpine    Up X seconds (healthy)
#   aimes-redis    redis:7-alpine        Up X seconds (healthy)
#   aimes-rabbit   rabbitmq:3.13-mgmt    Up X seconds (healthy)
#   aimes-qdrant   qdrant/qdrant:v1.13   Up X seconds (healthy)
#   aimes-api      aimes-api:latest      Up X seconds (healthy)
```

---

## 2. 第一次访问

打开浏览器：**http://localhost:5003**

会自动跳转到登录页。用：

```
账号: admin
密码: admin@123
```

> ⚠️ 仅演示用。生产环境请立即修改密码 + 配置 `Jwt:SigningKey`，详见 [部署指南](#5-生产部署提示)。

登录后，应该看到：

1. **排程甘特图**（默认页）：含 ~20 个演示工单，瓶颈设备高亮，部分工单冲突闪烁
2. 顶部导航栏：生产 / 质量 / 设备 / 异常 / 库存 / 知识库 / 管理

---

## 3. 5 分钟体验路径

按这个顺序看一圈，能完整理解 AIMes 价值：

| 步骤 | 路径 | 看什么 |
|---|---|---|
| 1 | `/scheduling/` | AI 排程结果，鼠标悬停看决策追溯 |
| 2 | `/dashboard/production` | 生产实时概览（OEE、产出、不良率） |
| 3 | `/dashboard/risk` | RiskBoard 四大风险预警 |
| 4 | `/quality/spc` | SPC 控制图 + 运行规则告警 |
| 5 | `/swagger` | 完整 REST API 文档（约 80+ endpoints） |

---

## 4. 端口表

| 服务 | 主机端口 | 容器端口 | 用途 |
|---|---|---|---|
| AIMes API | 5003 | 5003 | 后端 + 前端静态资源 |
| PostgreSQL | 5432 | 5432 | 业务数据 |
| Redis | 6379 | 6379 | SignalR backplane / 缓存 |
| RabbitMQ AMQP | 5672 | 5672 | MassTransit 消息 |
| RabbitMQ UI | 15672 | 15672 | 管理控制台 (guest/guest) |
| Qdrant | 6333 | 6333 | 向量库（仅商业版完整启用） |

如果 API 宿主机端口 `5003` 被占用，不要改回 `5000`；设置 `AIMES_API_HOST_PORT=5004` 后重新启动 API，并让前端使用 `VITE_API_TARGET=http://localhost:5004`。其他端口冲突可修改 `docker-compose.yml` 的对应 `ports` 段，或停掉占用端口的本地进程。详见 [troubleshooting.md](troubleshooting.md)。

---

## 5. 生产部署提示

`docker-compose.yml` **是开发/演示配置，不能直接用于生产**。生产部署至少需要：

- ✅ 修改 `Jwt:SigningKey`（环境变量 `Jwt__SigningKey`，强随机 ≥32 字节：`openssl rand -base64 48`）
- ✅ 修改 PostgreSQL 默认密码
- ✅ 修改 admin / admin@123 默认账号密码
- ✅ 反向代理 (nginx/traefik) + HTTPS 证书
- ✅ **关闭演示开关**：把环境变量 `Aimes__DisableHttpsRedirect` 设为 `false`（或不设，让 `appsettings.Production.json` 生效）。否则全程 HTTP 跑工厂 MES，账号/工单数据明文走网络。
- ✅ **关闭 Swagger**：把 `Aimes__EnableSwagger` 设为 `false`。
- ✅ **反向代理后必须显式开启 `Aimes__TrustForwardedHeaders=true`**：否则 ASP.NET 不读 X-Forwarded-For，登录速率限制（10次/分/IP）会把整个工厂折叠成同一个网关 IP 桶——任何一个员工触发限速则全员被锁。**默认关闭是安全设计（直接暴露公网时防 IP 伪造）**，但一旦在反代后必须开启。
- ✅ 数据卷外挂 / 备份策略
- ✅ Serilog → 集中日志（ELK / Loki）

如需企业级部署支持，参见 [`commercial-vs-opensource.md`](commercial-vs-opensource.md)。

---

## 6. 卡住了？

→ [troubleshooting.md](troubleshooting.md) 覆盖最常见的 8 个问题。

90% 的"起不来"都是端口冲突或 Docker 内存不足。
