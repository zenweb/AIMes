# Todo: 员工列表真实浏览器证据补强

- [x] 用稳定 Playwright 脚本补 DOM 级证据：真实 token + `aimes_offline_demo=true` 下员工页显示后端 3 名员工且无 skip 红条。
- [ ] 若用户浏览器仍看到旧文案，指导刷新页面缓存或重新登录，确认加载的是最新 4173 bundle。
- [ ] 继续扫其它真实登录态下的 runtime gate，优先处理用户必经路径。

## 2026-06-20 证据
- 已补真实浏览器证据：员工页请求 `/api/v1/employee?page=1&pageSize=20` 返回 200，渲染 3 张员工卡，无 offline skip 文案。
