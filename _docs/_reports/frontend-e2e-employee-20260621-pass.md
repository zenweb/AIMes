# Frontend Employee E2E Evidence - PASS

日期：2026-06-21

## 范围

员工管理真实浏览器 e2e 单片，覆盖离线演示入口、人员技能矩阵、替班候选、停工复核、生产开工、AI 排产、报表中心、审计回放与 fail-loud 写入失败。

## 验证命令

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/employee.spec.ts
```

## 结果

- 12/12 tests passed
- 浏览器：Chromium
- Nuxt production build：PASS
- Playwright runtime：PASS

## 修复点

- e2e 默认员工用例显式使用 `offlineDemo=1` 和 demo admin session，避免离线演示误报 `Offline demo mode skipped backend request`。
- live/mock 员工数据用例补齐 token、refresh token、user、role，并用 `aimes_e2e_live_mock` 防止 describe 级 demo init script 覆盖 mock session。
- mock 员工场景补齐 `/api/v1/auth/refresh`、员工接口、执行证据与 OTD 证据接口；未声明 API 默认返回 200，避免无关 401 清认证导致 login/dashboard 循环。
- 跨模块 demo 导航统一显式携带 `offlineDemo=1`，覆盖 report、audit-logs、admin、production、scheduling。

## 结论

员工列表加载失败的原始问题已通过真实浏览器证据收口：离线演示入口不再向用户暴露 backend skip 技术错误；员工能力约束与替班/停工复核链路在 e2e 中稳定通过。
