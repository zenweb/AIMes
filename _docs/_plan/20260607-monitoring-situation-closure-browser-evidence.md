# Plan：MonitoringBoard 现场态势处置包闭环真实浏览器证据

## 成功标准

- Chromium 中打开实时监控页。
- 现场态势能升级为跨模块处置包。
- 风险页能关闭该处置包。
- 关闭后风险队列展示已闭环 trace。
- 排产页能显示已缓解状态和闭环复核建议。
- 审计页能展示已闭环状态，并回放关闭留痕。

## 执行

1. 读取现有监控 e2e 和已有监控证据文档。
2. 选择既有 `现场态势处置包关闭后反写排产复核和审计闭环状态` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "现场态势处置包关闭后反写排产复核"
```

结果：`1 passed`。
