# 2026-06-20 Plan: 员工列表 offline demo skip 运行态闭环

## 目标

员工列表在离线演示模式下跳过后端员工接口时，用户看到可用的本地人员示例和技能矩阵，不看到底层 backend skip 文案。

## 步骤

1. 复查员工页加载路径、`getEmployeeList()` 与 offline demo 错误识别器。
2. 运行目标单测确认静默兜底已覆盖直接和包装后的 skip 错误。
3. 检查 4173 预览进程与 `.output` bundle，确认是否存在旧运行态。
4. 重启 4173 preview，并用真实浏览器验证员工页入口。
5. 记录 changelog/review/issue/todo/plan 五类证据。

## 完成标准

- 员工示例数据可见。
- 页面没有 `员工列表加载失败`。
- 页面没有 `Offline demo mode skipped backend request`。
- 目标单测、lint、diff check 通过。

## 当前状态

已完成。
