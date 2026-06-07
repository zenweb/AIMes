# Review: Dashboard 生产概览数据读取失败可见化

日期：2026-06-06

## 结论

- 未发现本片新增阻断问题。
- Dashboard 后端生产概览数据读取失败已从静默 0 值变成页面可见 fail-loud 状态。
- 真实浏览器验证已覆盖 happy path 与 `/api/v1/dashboard` 503 失败态。

## 证据

- 单元测试新增初始化失败路径：`getDashboard` 抛错时，页面保留 `生产运营控制塔` 并展示 `生产概览数据读取失败`、影响面和错误原因。
- Chromium e2e 新增失败态：关闭 offline demo，拦截 `/api/v1/dashboard` 为 503，断言 fail-loud region 可见。
- 覆盖率验证：`DashboardBoard.vue` branches 73.68%，lines 75.94%。
- 生产构建：Nuxt production build passed。

## 剩余风险

- 本片只覆盖生产概览主数据读取失败路径。
- Dashboard 仍有 shortage resolution fallback 等路径可继续按覆盖率杠杆审计。
- B 轨道发布闸门仍缺人工与环境证据，不能声明发布完成。
