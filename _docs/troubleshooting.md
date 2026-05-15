# AIMes Troubleshooting

> 评估期最容易卡住的 8 个问题。按"起不来" → "起来了但访问不了" → "访问到了但不对劲"分组。

---

## 起不来

### 1. `Bind for 0.0.0.0:5432 failed: port is already allocated`

**原因**：本机已有 PostgreSQL 实例占用 5432。

**修复方案 A**（推荐，10 秒）：改 `docker-compose.yml`：

```yaml
postgresql:
  ports:
    - "15432:5432"   # 改主机端口，容器内仍是 5432
```

其他容器通过 `Host=postgresql` 内部网络访问，无影响。

**修复方案 B**：停掉本机 PostgreSQL（`brew services stop postgresql` / `sudo systemctl stop postgresql` / Windows Services）。

同样思路适用于 6379 (Redis) / 5672 (RabbitMQ) / 15672 (RabbitMQ UI) / 6333 (Qdrant) / 5000 (API)。

### 2. `aimes-pg` 容器一直 unhealthy / 重启循环

**原因**：通常是 Docker 内存不足。PostgreSQL 在低于 1GB 时会反复 OOM。

**诊断**：

```bash
docker compose logs postgresql | tail -50
docker stats --no-stream
```

如果看到 `out of memory` 或容器频繁退出。

**修复**：Docker Desktop → Settings → Resources → Memory ≥ 8 GB → Apply & Restart。

### 3. 首次启动 db init 报错

**症状**：`docker compose logs postgresql` 看到 `psql: ERROR: ... already exists`。

**原因**：之前启动失败留下了脏数据卷。

**修复**：

```bash
docker compose down -v   # -v 一并删除卷
docker compose up -d
```

⚠️ `down -v` 会删数据。生产环境别这么干。

### 4. `aimes-api` 容器 healthy 但 5 分钟后挂掉

**原因**：API 启动需要 Postgres / Redis / RabbitMQ 都 healthy，依赖链很长。如果某个数据容器在 healthcheck 通过后又出问题，API 会因连接失败崩溃。

**诊断**：

```bash
docker compose logs api --tail=100
docker compose logs rabbitmq --tail=20
```

**修复**：把所有依赖容器一起重启 — `docker compose restart`。如果还不行 → 全删重来（方案 3）。

---

## 起来了但访问不了

### 5. 浏览器打开 `http://localhost:5000` 报"无法访问此网站"

**最常见原因**：HTTPS 重定向。0.1.0 之前的版本会无条件 307 跳到 https，docker compose 没暴露 HTTPS → 浏览器报错。

**当前版本（v0.1.0+）已修复**：默认关闭 docker compose 的 HTTPS 重定向。如果你 build 自定义镜像出现这个问题，确认环境变量：

```yaml
environment:
  Aimes__DisableHttpsRedirect: "true"
```

### 6. `/swagger` 返回 404

**最常见原因**：v0.1.0 之前 Swagger 仅在 Development 模式启用，docker compose 用 Production → 直接 404。

**当前版本（v0.1.0+）已修复**：默认启用。如果还是 404，确认环境变量：

```yaml
environment:
  Aimes__EnableSwagger: "true"
```

生产环境如不希望对外暴露 Swagger，把 `Aimes__EnableSwagger` 设为 `"false"`。

### 7. 看板空白页 / 控制台报 "Failed to load resource"

**原因**：前端构建产物没挂载到 API `wwwroot/scheduling/`。

**诊断**：

```bash
docker compose exec api ls /app/wwwroot/scheduling
# 应该看到 index.html + assets/
```

如果目录为空，`Dockerfile` 的 `COPY --from=frontend-build` 没跑。

**修复**：

```bash
docker compose build api --no-cache
docker compose up -d api
```

如果你修改过 `src/frontend/`，记得：

```bash
docker compose build api  # 重新构建前端
```

---

## 访问到了但不对劲

### 8. 登录后甘特图没数据 / 列表全空

**原因**：`db/seed.sql` 没跑成功，数据库里只有结构没有演示数据。

**诊断**：

```bash
docker compose exec postgresql psql -U postgres -d mes -c "SELECT COUNT(*) FROM \"WorkOrders\";"
# 期望看到 ≥ 20 行
```

**修复**：

```bash
docker compose down -v  # ⚠️ 删数据卷
docker compose up -d    # 重启会自动跑 init.sql + seed.sql
```

### 9. 收不到实时通知 / SignalR 连不上

**原因**：通常是 Redis 连不上（SignalR backplane）。

**诊断**：

```bash
docker compose logs api 2>&1 | grep -i signalr
```

**修复**：检查 `aimes-redis` 容器状态，必要时重启：

```bash
docker compose restart redis api
```

---

## 还是不行？

1. **完整日志打包**：`docker compose logs > aimes-debug.log`
2. **环境信息**：`docker version && docker compose version && uname -a`
3. **GitHub Issues**：附上 1+2，我们会在 1 个工作日内回复
4. **商业版用户**：直接联系技术支持，详见 [`commercial-vs-opensource.md`](commercial-vs-opensource.md)
