# Issue: QualityCapaTaskPanel 复用草案转正式 CAPA 写入失败伪造风险

## 背景

质量知识复用草案转正式 CAPA 会驱动质量闭环、审计回放、OTD 复盘和后续 AI 推荐排序。如果正式 CAPA 闭环记录写入失败但页面继续显示成功，用户会误以为 CAPA 已归档，形成合规和追溯风险。

## 处理

- 新增真实 Chromium 用例覆盖 `aimes_quality_knowledge_reuse_closures` 写入失败。
- 验证页面显示 `质量知识复用转正式 CAPA 失败`。
- 验证失败后保留草案待复核状态，不显示正式 CAPA trace，不写入闭环记录或 OTD 证据。

## 当前状态

目标真实浏览器用例已通过。
