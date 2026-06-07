# 2026-06-07 Plan - SPC 加载失败恢复 Chromium 证据

## 成功标准

- 真实 Chromium 中可复现 SPC API 首次 503。
- 页面显示 SPC 加载失败 alert。
- 页面显示 fallback SPC 图点，不显示空状态。
- 切换参数后 API 成功，页面清理 stale alert。
- 后续成功态使用后端返回的 3 个数据点。
- 定向 e2e 通过。

## 执行

1. 读取 SPC 失败/恢复单测和 `QualityBoard` 加载逻辑。
2. 新增失败恢复 e2e，关闭 offline demo。
3. Mock 统计、检验批次、异常 API 成功，隔离 SPC 行为。
4. 首次 SPC 返回 503，切换 `hardness` 后返回成功数据。
5. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "SPC 趋势分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展 SPC 新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
