# Todo - Frontend Employee Demo Deeplink Next Actions

- 使用新版入口手工复查 `/scheduling/employee?offlineDemo=1`。
- 若仍访问旧 `4173`，重启对应预览进程或改用最新生产 build preview 入口。
- 继续扫描其他受保护离线演示深链，确认登录后都能回到原目标页。
- 已补跑 `tests/e2e/employee.spec.ts` 全文件并通过 13/13；后续如改动人员、登录、offline demo、报表或审计回放链路，需要重新跑全量。
