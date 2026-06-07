# Issue: Demo Smoke 主链路证据缺口

## 背景

5 分钟 Demo 主链路是用户必经的发布展示路径。若只补单页失败态，而缺少 Dashboard、Scheduling、Audit、Report 的真实 Chromium 串联证据，会让发布演示可信度不足。

## 处理

- 使用现有 `demo-smoke.spec.ts` 定向运行主链路。
- 验证 Nuxt production build 后真实 Chromium 可完成：
  - Dashboard OTD 摘要。
  - Scheduling Agent 生成并采纳推荐。
  - Audit 回放急单插入决策链。
  - Report 展示 OTD 改善复盘和 Demo 路径。

## 结果

- 当前结果：PASS。
- 证据文件：`_docs/_reports/demo-smoke-main-chain-browser-evidence-20260607.md`。

## 剩余问题

此 issue 不关闭 v1.0.0 B 轨硬门禁。PostgreSQL/staging、Attack Chain 人工验证、安全签字和灰度观察仍需单独关闭。
