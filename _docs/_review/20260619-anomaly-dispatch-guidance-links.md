# 20260619 Anomaly Dispatch Guidance Links Review

## 范围
- 文件：`src/frontend/src/components/anomaly/AnomalyBoard.vue`
- 测试：`src/frontend/tests/unit/anomaly-board.test.ts`

## 评审结论
- 异常分流是会写入下游处置证据的复杂操作，现已在操作前给出中英双语核对提示。
- UI 相关要点已做成上下文链接，用户可直接跳转风险、质量、排产和帮助锚点。
- `aria-describedby` 已把事件队列和帮助提示关联，辅助技术可读取操作上下文。

## 风险
- 当前帮助入口是页面内锚点，不是独立帮助中心。若后续有模块级帮助页，可将 `#anomaly-dispatch-help` 替换为正式帮助路由。
- 真实浏览器链接包含 `/scheduling/` 前缀，这是当前应用 baseURL 行为，不属于本片变更。

## 验证
- RED 已确认缺少 `.dispatch-guidance` 时目标测试失败。
- GREEN 后目标测试、异常面板测试、全量覆盖率、lint、build 均通过。
- 已取得真实浏览器截图证据：`anomaly-dispatch-guidance-real-browser-20260619`。
