# 2026-06-07 AuditDecisionReplayPanel 业务落库审计载荷损坏证据 Next Actions

## 下一步

- 继续按覆盖率杠杆推进 `AuditDecisionReplayPanel` 低分支路径。
- 优先选择与发布签字相关的审计链路：POC 签署载荷异常、配置审批异常、业务落库不支持资源。
- 保持 B 轨发布闸门独立追踪：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 停止条件

- 如果某条审计分支只能靠高度伪造的组件内部状态触发，停止并换成能由真实浏览器通过公开 API/存储入口稳定证明的路径。
