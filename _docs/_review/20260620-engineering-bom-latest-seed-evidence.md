# 2026-06-20 Review - 工程与 BOM latest 证据种子恢复

## 结论
- scheduling 页面剩余背景 404 的根因是工程/BOM latest 合约存在，但当前数据缺少 `agent_evidence_links` 当前记录。
- 修复只补齐现有 BOM 齐套、替代料审批、工程变更影响、路线能力放行证据，不扩大功能范围。

## 覆盖
- 集成测试覆盖四个 endpoint、payload 可审计性和四个 deterministic evidence key。
- Docker SQL 覆盖当前 PostgreSQL 恢复。
- 真实浏览器覆盖 scheduling 页面，复扫后 errors 为空。

## 风险
- 与已有 upsert 测试共存时，latest 可能被更新记录覆盖；测试不强绑 latest 必须等于 seed，只要求 endpoint 可用且 seed key 存在。
