# 2026-06-20 Issue - Quality latest 背景请求 404

## 现象
- 报表、审计日志、质量页存在 quality latest 背景请求 404：
  - `/api/v1/scheduling/quality-rework-impact/latest`
  - `/api/v1/scheduling/quality-mrb-disposition/latest`
  - `/api/v1/scheduling/quality-capa-closure/latest`

## 根因
- endpoint 与 service 合约已存在，但当前集成测试种子和 Docker PostgreSQL 当前库没有对应 `agent_evidence_links` 记录。
- latest 查询按 evidence type 取最近记录，空数据时返回 404。

## 修复
- 补齐三条 deterministic quality evidence seed。
- 补齐 Docker SQL 恢复脚本。
- 增加集成测试避免回归。

## 证据
- 新增测试先 RED 后 GREEN。
- 直连 API 三个 endpoint 均 200。
- 真实浏览器三条相关页面无 quality latest 404。
