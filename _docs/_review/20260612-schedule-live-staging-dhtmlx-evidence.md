# 2026-06-12 Review: 排产 live staging 真实 dhtmlx 证据

## 审计结论

- 通过。当前证据证明真实浏览器、真实 dhtmlx、真实 API、PostgreSQL 同链路拖拽保存闭环。

## 关键检查

- live E2E 默认 gated，未设置 `AIMES_RUN_LIVE_STAGING_E2E=true` 时跳过，不进入快速默认路径。
- 测试不依赖现有 staging 账号；运行时 seed 临时管理员，结束后清理。
- 测试数据避开 8 小时锁定期，避免误把业务拒绝拖拽当成环境失败。
- PATCH 成功以 2xx 判定，最终以 GET read model 和 PostgreSQL 窗口一致作为硬证据。

## 风险

- 该证据依赖本机 Docker compose、API 宿主机 5002 端口和 PostgreSQL 容器可用。
- live E2E 会写入临时 probe 数据；已在 `afterAll` 清理，但异常中断时可能需要手动清理同名前缀数据。

## 复核命令

```powershell
$env:AIMES_RUN_LIVE_STAGING_E2E='true'
$env:AIMES_LIVE_API_BASE_URL='http://localhost:5002'
npm run test:e2e -- --grep "live staging"
```
