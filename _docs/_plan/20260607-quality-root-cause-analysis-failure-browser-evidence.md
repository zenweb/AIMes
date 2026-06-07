# 2026-06-07 Plan - 根因分析加载失败 Chromium 证据

## 成功标准

- 真实 Chromium 中可复现根因分析 API 503。
- 页面显示根因分析加载失败 alert。
- 页面展示 fallback 根因分析 dialog。
- 定向 e2e 通过。

## 执行

1. 读取根因分析失败单测和 `QualityBoard` 加载逻辑。
2. 新增失败态 e2e，关闭 offline demo。
3. Mock 统计、检验批次、异常、SPC API 成功，隔离根因分析行为。
4. 注入 `INS-ROOT-FAIL` 根因分析 503。
5. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "根因分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展根因分析新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
