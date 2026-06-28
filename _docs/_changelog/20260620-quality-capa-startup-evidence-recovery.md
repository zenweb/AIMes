# 质量 CAPA 启动证据恢复与可选 latest 空状态

## 变更
- `QualityCapaTaskPanel` 启动读取质量知识、灰度决策和助手执行包证据时改为逐源恢复。
- 非 offline demo 的启动读取失败会聚合成一个可见告警，并保留本地 CAPA 处置状态。
- offline demo skip 不再泄露技术错误文案。
- HTTP 层新增 `suppressErrorToast` 请求标记，供可选 latest 读取自行处理空状态。
- `quality-mrb-disposition/latest` 与 `risk-sla-review/latest` 使用 suppress 标记，404 暂无记录不再弹全局请求错误 toast。

## 验证
- `npm run test:unit -- tests/unit/quality-capa-task-panel.test.ts tests/unit/quality-knowledge-sample-sync.test.ts tests/unit/http-refresh.test.ts tests/unit/quality-evidence-api.test.ts tests/unit/risk-evidence-api.test.ts`：5 files / 72 tests passed。
- `npm run build`：通过。
- 真实浏览器：真实 JWT + `aimes_offline_demo=true` 访问 `/scheduling/quality`，`.quality-board=true`，`.quality-capa-panel=true`。
- 真实浏览器：4 个 `/api/v1/scheduling/quality-knowledge-evidence?...` 请求均返回 200。
- 真实浏览器：`quality-mrb-disposition/latest` 与 `risk-sla-review/latest` 仍返回 404 空状态，但页面 `alertTexts=[]`，无全局错误 toast。
- 真实浏览器：页面不包含 `Offline demo mode skipped backend request`，也不包含 `质量 CAPA 启动证据刷新失败`。
