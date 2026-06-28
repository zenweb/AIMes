# 2026-06-21 Plan - Frontend Employee E2E Closure

## 成功标准

- 员工页离线演示入口不暴露 backend skip 技术错误。
- 员工能力约束、替班建议、停工复核、重新放行、报表与审计回放 e2e 全部通过。
- 不新增业务范围，只修复测试夹具与验证入口。

## 执行结果

- 已完成：定位 demo token 与 live/mock token 混用导致的路由守卫清会话。
- 已完成：补齐 mock session、refresh、员工接口、证据接口与跨模块 demo query。
- 已完成：`npm run test:e2e -- tests/e2e/employee.spec.ts` 通过。

## 后续计划

- 下一片继续真实浏览器证据 sweep，优先用户必经路径和当前低稳定性的模块。
- 全站 sweep 前先控制 e2e 端口与残留 Node 进程，降低验证噪声。
