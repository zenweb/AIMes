# 2026-06-20 报表 optional latest 空状态静默处理

## 变更
- 修正报表中心启动证据读取边界：`/latest` 类可选证据接口返回 404 时视为“暂无记录”，不再触发报表证据加载失败横幅或全局请求错误 toast。
- 为 customer order import、POC signoff/rollout/pilot/hypercare、schedule adoption feedback、equipment fault、quality rework、quality CAPA 等 optional latest API 增加 `suppressErrorToast`。
- 保留 fail-loud 语义：非 404 的真实后端异常仍由调用方聚合告警或按 `failLoud` 抛出。

## 验证
- `npm run test:unit -- tests/unit/report-board.test.ts tests/unit/poc-evidence-api.test.ts tests/unit/scheduling-api.test.ts tests/unit/equipment-evidence-api.test.ts tests/unit/quality-evidence-api.test.ts tests/unit/http-refresh.test.ts`：6 files / 60 tests passed。
- `npm run build`：通过。
- 真实浏览器 `/scheduling/report`：真实 JWT + `aimes_offline_demo=true`；12 个 optional latest 404 仍存在，但 UI 中 `报表证据加载失败=false`、`请求错误 toast=false`、`Offline demo skip=false`、`alertTexts=[]`。
