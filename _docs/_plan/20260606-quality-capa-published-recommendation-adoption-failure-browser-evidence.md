# 2026-06-06 Plan - 发布推荐采纳失败 Chromium 证据

## 成功标准

- 真实 Chromium 能渲染已发布推荐卡片。
- 采纳反馈写入失败时页面展示 `质量知识发布推荐采纳失败`。
- 失败后采纳按钮仍可见。
- 失败后不显示采纳反馈、已采纳状态、推荐采纳 trace、下一轮训练 trace。
- localStorage 和 OTD 证据链均不出现伪造采纳证据。

## 执行

1. 在 `quality.spec.ts` 增加发布推荐采纳失败镜像用例。
2. 使用本地预置状态渲染 `QK-TRAIN-20260521-R2` published 推荐。
3. 拦截推荐反馈 storage key 的 `setItem` 并抛错。
4. 点击采纳按钮并验证 fail-loud 与无伪证据。
5. 单独运行目标 e2e。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "发布推荐采纳写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 停止条件

本片达到 A 轨证据标准后停止，不继续空跑 B 轨；B 轨等待外部环境/人工签字/观察窗口证据。
