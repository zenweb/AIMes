# Plan: 质量 CAPA 启动证据恢复与可选 latest 空状态

## 成功标准
- 质量 CAPA 面板启动时，多源证据读取失败不应让组件初始化挂掉。
- offline demo skip 不暴露技术错误给用户。
- 真实后端失败应 fail loud，但保留本地处置状态。
- 可选 latest 404 暂无记录不应弹全局请求错误 toast。

## 执行
1. 读取质量知识证据、DocumentUpload、QualityCapaTaskPanel 与相关测试。
2. 在 `QualityCapaTaskPanel` 增加逐源启动恢复与聚合告警。
3. 在 HTTP 层增加 `suppressErrorToast`，并只用于 MRB/Risk SLA 可选 latest 读。
4. 补充单测与真实浏览器证据。

## 状态
- 已完成并验证。
