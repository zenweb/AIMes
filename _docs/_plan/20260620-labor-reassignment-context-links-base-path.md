# 2026-06-20 Plan - 人员替班关联链接 Base Path 修复

## 目标
- 人员替班/停工复核帮助区的关联入口必须能在 `/scheduling/` 应用下正确导航。

## 步骤
1. 读取人员管理组件与现有测试。
2. 用单测先暴露错误 href。
3. 最小修改三个跨模块链接。
4. 运行人员面板、员工页、人员证据同步相关测试。
5. 构建并在真实浏览器验证 href。

## 成功标准
- 链接指向 `/scheduling/production`、`/scheduling/scheduling`、`/scheduling/audit-logs`。
- 员工页仍无 API 或离线 demo 降级。
