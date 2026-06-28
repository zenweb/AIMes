# 20260619 Anomaly Dispatch Guidance Links

## 变更
- 在异常管理的现场事件中心加入异常分流操作提示，覆盖简体中文和英文。
- 为确认分流前的复杂操作补充关联入口：风险预警、质量闭环、AI 排产、帮助。
- 将异常分流事件队列通过 `aria-describedby="anomaly-dispatch-help"` 关联到操作提示。

## 验证
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "guides anomaly dispatch"`：通过。
- `npm run test:unit -- tests/unit/anomaly-board.test.ts`：21 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1101 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器证据：`anomaly-dispatch-guidance-real-browser-20260619`。

## 备注
- 生产预览路由受 `baseURL: /scheduling/` 影响，真实浏览器中的链接显示为 `/scheduling/risk`、`/scheduling/quality`、`/scheduling/scheduling`，与项目现有路由基准一致。
