# 2026-06-20 Issue: 员工列表 offline demo skip 文案外露

## 现象

用户在员工列表看到：

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## 根因

代码层已具备 offline demo skip 静默兜底，但 4173 预览进程从 2026-06-19 22:20 持续运行，用户访问入口存在旧进程/旧页面状态风险。当前 `.output` bundle 中已包含静默判断。

## 修复

- 确认员工页与 offline demo 错误识别器测试覆盖。
- 重启 4173 预览服务。
- 用真实浏览器重新验证 `/scheduling/employee?offlineDemo=1`。

## 结果

员工页展示本地员工示例数据，无 `[role="alert"]`，无 backend skip 文案。

## 未覆盖

- 未声明 Nuxt dev server 历史 rollup input 阻塞已修复。
- 未执行全量前端回归；本次为员工列表目标切片。
