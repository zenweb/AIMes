# 2026-06-07 Plan - 质量异常告警加载失败 Chromium 证据

## 成功标准

- 真实 Chromium 中可复现 `/api/v1/anomaly` 503。
- 页面显示质量异常告警加载失败 alert。
- 页面保留本地 fallback 异常告警。
- 页面不显示 `暂无异常告警`。
- 定向 e2e 通过。

## 执行

1. 读取质量异常告警单测和 `QualityBoard` 加载逻辑。
2. 新增失败态 e2e，关闭 offline demo。
3. Mock 统计、检验批次、SPC API 成功，隔离 anomaly 失败。
4. 注入 `/api/v1/anomaly` 503。
5. 断言 alert、3 条 fallback 告警和非空状态。
6. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量异常告警加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展质量告警新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
