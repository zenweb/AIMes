# 2026-06-07 Plan - AuditDecisionReplayPanel 未知业务落库资源 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造未知业务落库资源。
- 页面必须展示 fail-loud 告警，包含损坏审计编号和未知资源名。
- 同批次成功业务落库回放必须仍可打开，不能因未知资源丢失。

## 执行

1. 读取 AuditDecisionReplayPanel 和现有 audit e2e。
2. 选择已由单元覆盖但缺 Chromium 证据的未知资源分支。
3. 新增真实 Chromium e2e，通过 route mock 返回成功详情和未知资源详情。
4. 跑定向 e2e 与对应单元测试并记录结果。

## 非目标

- 不修改产品代码。
- 不扩大到全量 audit e2e 套件。
- 不关闭 B 轨发布闸门。
