# 2026-06-07 Plan - 质量知识复用草案写入失败 Chromium 证据

## 成功标准

- 真实 Chromium 中先完成质量知识样本前置入库。
- 真实 Chromium 中可复现 `aimes_quality_knowledge_reuse_drafts` 写入失败。
- 用户点击 `生成同类缺陷处置草案` 后页面 fail-loud。
- 页面不显示草案成功状态、审计号、trace 或成功消息。
- 本地 storage 不写入复用草案记录。
- 定向 e2e 通过。

## 执行

1. 读取现有复用草案成功 e2e、单测和 `QualityBoard` 写入逻辑。
2. 新增失败态 e2e，先通过真实 UI 生成质量知识样本。
3. 通过 `Storage.prototype.setItem` 注入 `aimes_quality_knowledge_reuse_drafts` 写入失败。
4. 断言 alert、可重试按钮、无 `.reuse-draft-result`、无草案 audit/trace。
5. 运行定向 Chromium e2e。

## 验证命令

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用草案写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 非目标

- 不修改产品代码。
- 不扩展质量知识新能力。
- 不处理 Hosted CI、PostgreSQL/staging、灰度、安全签字等 B 轨闸门。
