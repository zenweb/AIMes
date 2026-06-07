# 2026-06-07 Review - RoutingBoard 工艺路线列表加载失败 Chromium 证据

## 审计结论

通过。`RoutingBoard` 已补齐工艺路线列表加载失败的真实 Chromium 证据，覆盖 fail-loud 和 fallback 路线清单保留。

## 证据

- 新增用例位置：`src/frontend/tests/e2e/routing.spec.ts`
- 用例名：`工艺路线列表加载失败时真实浏览器展示 fail-loud fallback`
- 验证命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "工艺路线列表加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 风险与边界

- 本轮只跑单条目标 e2e，未全量回归工艺路线相关模块。
- 当前用户可见错误原因来自接口响应：`chromium routing list API unavailable`。
- B 轨发布闸门仍未关闭，不能把此 A 轨证据等同于 v1.0.0 发布就绪。
