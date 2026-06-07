# 2026-06-07 AuditDecisionReplayPanel 质量灰度决策坏载荷证据 Next Actions

## 下一步

- 继续按覆盖率杠杆推进 `AuditDecisionReplayPanel` 的真实浏览器证据。
- 优先选择与发布签字可信度相关的链路：POC 签署坏载荷、配置审批坏载荷、质量推荐反馈坏载荷。
- 继续把 B 轨发布闸门单独追踪：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 停止条件

- 如果某条审计分支只能靠高度伪造的组件内部状态触发，停止并换成能由真实浏览器通过公开 API/存储入口稳定证明的路径。
- 如果真实浏览器证据无法稳定复现，先提出阻塞点，不继续用随机等待或重复试跑烧 token。
