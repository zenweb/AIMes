# 2026-06-07 Plan - AuditDecisionReplayPanel 业务落库审计载荷缺失 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造后端业务落库审计详情载荷缺失。
- 页面必须展示 fail-loud 告警，包含缺失审计编号和载荷缺失原因。
- 同批次成功业务落库回放必须仍可打开，不能因空载荷丢失。

## 执行

1. 读取 AuditDecisionReplayPanel 既有单元测试和 audit e2e。
2. 选择已由单元覆盖但缺 Chromium 证据的缺失审计载荷分支。
3. 新增真实 Chromium e2e，通过 route mock 返回成功详情和缺失载荷详情。
4. 跑定向单元测试、定向 e2e 并记录结果。

## 非目标

- 不修改产品代码。
- 不扩大到全量 audit e2e 套件。
- 不关闭 B 轨发布闸门。
