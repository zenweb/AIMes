# 2026-06-07 Plan - AuditDecisionReplayPanel POC 复盘签署载荷缺失 Chromium 证据

## 成功标准

- 真实 Chromium 中可构造后端 POC 复盘签署记录载荷缺失。
- 页面必须展示 fail-loud 告警，包含缺失签署记录编号和载荷缺失原因。
- 基础回放卡片必须仍可见。
- 缺失载荷的 POC 签署记录不能生成可信回放卡片。

## 执行

1. 读取 POC 复盘签署单元测试、成功 e2e 和同步工具。
2. 新增真实 Chromium e2e，通过 route mock 返回缺字段签署记录。
3. 关闭 offline demo，并屏蔽无关接口噪声。
4. 跑定向 e2e 并记录结果。

## 非目标

- 不修改产品代码。
- 不扩大到全量 audit e2e 套件。
- 不关闭 B 轨发布闸门。
