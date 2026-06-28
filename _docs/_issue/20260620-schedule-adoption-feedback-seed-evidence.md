# 2026-06-20 Issue - Schedule 采纳反馈 latest 为空

## 现象
- `/scheduling/scheduling` 首屏 current plan 已可用，但 `/api/v1/scheduling/adoption-feedback/latest` 仍返回 404。
- 页面 Agent 状态长期显示“无反馈”，排产方案采纳闭环证据不完整。

## 根因
- Docker PostgreSQL 与集成测试 seed 只补了排产计划，没有补采纳反馈记录。
- `schedule_adoption_feedbacks` 当前为空。

## 处理
- 为当前排产计划补默认可审计采纳反馈。
- 更新恢复脚本，保证已有 volume 可以幂等补齐。
- 增加集成测试锁定 latest adoption feedback 的可审计字段。

## 状态
- 当前 Docker API 直接读取 latest adoption feedback 已返回 200。

