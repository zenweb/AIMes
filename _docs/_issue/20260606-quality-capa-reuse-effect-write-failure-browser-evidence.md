# Issue: QualityCapaTaskPanel 复用效果验证写入失败伪造风险

## 背景

质量知识复用效果验证会把正式 CAPA 从待验证推进到已验证，并生成复用效果 trace。若验证回写失败但页面继续显示成功，用户会误以为 CAPA 效果已归档，影响质量知识推荐排序、审计回放和 OTD 复盘。

## 处理

- 新增真实 Chromium 用例覆盖 `aimes_quality_knowledge_reuse_closures` 验证回写失败。
- 验证页面显示 `质量知识复用效果验证失败`。
- 验证失败后保留待验证状态，不显示复用效果 trace，不写入 verified 闭环记录或 OTD 证据。

## 当前状态

目标真实浏览器用例已通过。
