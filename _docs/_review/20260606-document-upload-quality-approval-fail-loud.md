# 2026-06-06 DocumentUpload 质量知识审批 fail-loud 自审

## 结论

未发现本切片新增阻断问题。

## 已核对

- 审批写入失败时不再产生未处理 Vue 事件错误。
- 失败路径不会写入上传历史，避免把失败动作伪装成已完成。
- 页面 alert 使用既有 `error-msg` 和 `aria-live="assertive"`。
- 真实 Chromium 覆盖了上传接口 HTML fallback 的行级 fail-loud 表现。

## 残余风险

- 本轮只修质量再训练审批失败；校验、合并、下一训练集审批等相邻动作仍有同步写入失败路径，后续应按同样规则逐片处理。
- e2e 使用路由模拟 HTML fallback，并不替代 staging API/PostgreSQL 真实演练。
- 发布 B 轨仍缺 hosted CI、staging rehearsal、攻击链人工验证、安全签字与灰度观察证据。
