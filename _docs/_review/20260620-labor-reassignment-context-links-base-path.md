# 2026-06-20 Review - 人员替班关联链接 Base Path 修复

## 结论
- 通过。

## 审查点
- 修复范围只限 `SkillMatrixPanel.vue` 与对应单测。
- 未改变人员替班/停工复核业务写入逻辑。
- 链接符合核心产品原则：复杂操作的相关入口可点击跳转，不再丢失 `/scheduling/` base path。

## 证据
- 真实浏览器读取 DOM href 均为可访问入口。
- 员工页仍真实请求 `/api/v1/employee?page=1&pageSize=20`。
