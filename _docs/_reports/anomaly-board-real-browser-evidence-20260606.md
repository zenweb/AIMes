# AnomalyBoard 真实浏览器证据刷新

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/anomaly/AnomalyBoard.vue`
- 证据类型：项目 Playwright Chromium e2e
- 目标：确认现场事件中心在生产构建下的异常分流和跨模块追溯链路仍可真实交互。

## 当前证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts
```

结果：

- Nuxt production build 成功。
- Chromium 执行 `tests/e2e/anomaly.spec.ts`。
- 5/5 passed。
- 覆盖路径包括：现场事件中心展示、异常详情 AI 分析建议、质量异常分流到风险/排产/OTD/审计、设备异常分流到设备维护/排产/OTD/审计、物料异常分流到库存/采购/排产/OTD/审计。
- 最大 JS chunk：817.50 kB。

## 结论

`AnomalyBoard` 当前真实浏览器关键路径可用。本轮没有发现需要继续试错修复的浏览器失败。下一步应避免盲目刷新已通过路径，改为按覆盖率和用户必经程度选择仍缺证据的组件。

## 发布闸门

本证据只证明本地 Playwright Chromium 下的异常闭环路径，不证明 Hosted CI、staging/PostgreSQL 演练、Attack Chain 人工验证、安全签字或灰度观察窗口。
