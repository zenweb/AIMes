# Issue: SkillMatrixPanel 人员证据同步写入失败真实浏览器缺口

## 背景

人员技能矩阵已具备同步 OTD 证据链的成功路径 e2e，也有单元测试覆盖写入失败告警。但缺少真实浏览器证据证明：当 `aimes_otd_evidence_chain` 写入失败时，页面不会误报人员能力证据已同步。

## 处理

- 新增 Chromium e2e，模拟 `Storage.prototype.setItem` 对 `aimes_otd_evidence_chain` 抛错。
- 验证页面展示 `人员证据同步失败`。
- 验证成功文案不可见、本地 OTD 证据链未写入。

## 当前状态

已补证据。目标 e2e 通过。
