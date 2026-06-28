# 2026-06-20 Review - 质量 latest 证据种子恢复

## 结论
- 根因是 quality latest endpoint 合约存在，但当前测试/演示数据缺少 `agent_evidence_links` 记录，导致真实浏览器背景请求 404。
- 修复没有改变 endpoint 合约，也没有新增业务范围，只补齐现有质量证据链的当前可审计记录。

## 覆盖
- 集成测试覆盖三个 endpoint 与数据库 evidence key。
- Docker PostgreSQL 恢复脚本覆盖当前 staging 数据。
- 真实浏览器覆盖报表、审计日志、质量页的运行态请求。

## 风险
- 本次只处理 quality latest 家族；shortage/supply、engineering/route、supplier 等剩余 optional latest 家族仍需后续按覆盖率杠杆继续清理。
