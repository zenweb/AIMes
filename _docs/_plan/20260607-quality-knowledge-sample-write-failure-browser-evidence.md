# 2026-06-07 Plan - 质量知识样本写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 中可复现 `aimes_quality_knowledge_samples` 写入失败。
- 用户点击 `沉淀为 CAPA 知识样本` 后页面 fail-loud。
- 页面不显示样本入库成功状态、审计号、trace 或成功消息。
- 本地 storage 不写入质量知识样本记录。
- 定向 e2e 通过。

## 执行

1. 读取现有质量知识样本成功 e2e、单测和 `QualityBoard` 写入逻辑。
2. 在成功用例旁新增失败态 e2e，复用扫码返工前置证据。
3. 通过 `Storage.prototype.setItem` 注入 `aimes_quality_knowledge_samples` 写入失败。
4. 断言 alert、可重试按钮、无 `.sample-synced`、无样本 audit/trace。
5. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识样本写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展质量知识新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
