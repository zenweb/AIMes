# 2026-06-07 Plan - AuditDecisionReplayPanel 业务落库审计载荷损坏 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造后端业务落库审计详情载荷损坏。
- 页面必须展示 fail-loud 告警，包含损坏审计编号和解析失败原因。
- 同批次成功业务落库回放必须仍可打开，不能因坏载荷丢失。

## 执行

1. 读取 AuditDecisionReplayPanel 和现有 audit e2e。
2. 选择已由单元覆盖但缺 Chromium 证据的损坏审计载荷分支。
3. 新增真实 Chromium e2e，通过 route mock 返回成功详情和损坏详情。
4. 跑定向 e2e 并记录结果。

## 非目标

- 不修改产品代码。
- 不扩大到全量 audit e2e 套件。
- 不关闭 B 轨发布闸门。
