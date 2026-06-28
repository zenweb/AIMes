# 2026-06-20 Issue - Scheduling 工程/BOM latest 背景请求 404

## 现象
- scheduling 页面存在四条背景 404：
  - `/api/v1/scheduling/bom-kitting-package/latest`
  - `/api/v1/scheduling/alternate-material-approval/latest`
  - `/api/v1/scheduling/engineering-change-impact/latest`
  - `/api/v1/scheduling/route-capability-validation/latest`

## 根因
- 四个 latest endpoint 均依赖 `agent_evidence_links`。
- 当前测试/演示数据缺少对应当前证据，因此返回 404。

## 修复
- 补四条 deterministic evidence seed。
- 补 Docker 当前库恢复 SQL。
- 新增集成测试防止回归。

## 证据
- 新增测试 RED→GREEN。
- 直连 API 四条均 200。
- 真实浏览器复扫 scheduling 后 errors 为空。
