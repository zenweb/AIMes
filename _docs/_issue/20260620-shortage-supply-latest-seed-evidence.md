# 2026-06-20 Issue - 缺料与供应 latest 背景请求 404

## 现象
- dashboard：`/api/v1/scheduling/shortage-risk-resolution/latest` 404。
- scheduling：
  - `/shortage-kitting/latest`
  - `/shortage-risk-resolution/latest`
  - `/supply-risk-escalation/latest`
  - `/supplier-network-decision/latest`
- purchase：
  - `/supply-risk-escalation/latest`
  - `/supplier-network-decision/latest`

## 根因
- 缺料/供应 latest 查询依赖 `agent_evidence_links`。
- 当前库缺少四类当前证据，因此 latest 返回 404。

## 修复
- 补四条 deterministic evidence seed。
- 补 Docker 当前库恢复 SQL。
- 新增集成测试防止回归。

## 证据
- RED→GREEN 集成测试。
- 直连 API 四条 200。
- 真实浏览器复扫后 dashboard/purchase 无 errors，scheduling 对应四条均 200。
