# 2026-06-06 DocumentUpload 下一训练集合并 fail-loud 自审

## 结论

未发现本切片新增阻断问题。

## 已核对

- 下一训练集候选合并写入失败时不再产生未处理 Vue 事件错误。
- 失败路径不会写入上传历史，避免把失败动作伪装成已完成。
- 页面 alert 使用既有 `error-msg` 和 `aria-live="assertive"`。
- Knowledge e2e 生产构建后 Chromium 全绿，说明本轮没有破坏知识治理主流程。

## 残余风险

- 本轮只修下一训练集合并失败；实验候选合并、实验影子验证仍有同步写入失败路径。
- e2e 没有覆盖本轮新增的合并失败分支，当前真实浏览器证据覆盖知识治理主流程和上传 HTML fallback。
- 发布 B 轨仍缺 hosted CI、staging rehearsal、攻击链人工验证、安全签字与灰度观察证据。
