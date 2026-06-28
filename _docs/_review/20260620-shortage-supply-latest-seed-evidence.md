# 2026-06-20 Review - 缺料与供应 latest 证据种子恢复

## 结论
- 根因是 latest endpoint 合约存在，但当前测试/演示数据缺少对应 `agent_evidence_links` 当前记录。
- 修复只补齐现有缺料、齐套、供应升级、供应商推荐链路的当前证据，不扩大功能范围。

## 覆盖
- 集成测试覆盖四个 endpoint 200、payload 可审计，以及四个 deterministic evidence key 存在。
- Docker SQL 覆盖当前 PostgreSQL 恢复。
- 真实浏览器覆盖 dashboard、scheduling、purchase 三条用户路径。

## 注意
- `scheduling` 页面仍有四条非本轮红点：`alternate-material-approval`、`bom-kitting-package`、`engineering-change-impact`、`route-capability-validation`。
