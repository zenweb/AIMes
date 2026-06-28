# 2026-06-21 Frontend Employee E2E PASS

## 变更

- 修复 `employee.spec.ts` 中离线 demo 与 live/mock session 混用导致的登录页跳转。
- 为员工 e2e 的 live/mock 分支补齐认证、refresh 与证据写入路由。
- 将员工链路跨模块跳转显式标记为 `offlineDemo=1`。

## 验证

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/employee.spec.ts
```

结果：12/12 tests passed。
