# 2026-06-06 Review - CAPA 验证同步失败 Chromium 证据

## 审计结论

通过。`QualityCapaTaskPanel` 已补齐基础 CAPA 验证同步失败的真实 Chromium 证据，覆盖 fail-loud、可重试和不伪造已验证/OTD 证据。

## 证据

- 新增用例位置：`src/frontend/tests/e2e/quality.spec.ts`
- 用例名：`CAPA 验证同步失败时真实浏览器展示 fail-loud 且不伪造验证留痕`
- 验证命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "CAPA 验证同步失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 风险与边界

- 本轮只跑单条目标 e2e，未全量回归 `quality.spec.ts`。
- 本轮未修改产品代码；如果后续 CAPA 任务状态机或 trace 命名调整，需要保留“失败不写 closure、不变已验证”的断言。
- B 轨发布闸门仍未关闭，不能把此 A 轨证据等同于 v1.0.0 发布就绪。
