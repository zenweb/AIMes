# 2026-06-06 DocumentUpload 实验影子验证 fail-loud 自审

## 结论

未发现本切片新增阻断问题。

## 已核对

- R7 实验影子验证写入失败时不再产生未处理 Vue 事件错误。
- 失败路径不会写入上传历史，避免把失败动作伪装成已完成。
- 页面 alert 使用既有 `error-msg` 和 `aria-live="assertive"`。
- 定向真实 Chromium 已覆盖 R7 影子验证写入失败态：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R7 影子验证写入失败"` -> 1/1 passed。
- Knowledge e2e 生产构建后 Chromium 全绿，说明本轮没有破坏知识治理主流程。

## 残余风险

- 本轮只修实验影子验证失败；客户工单导入生成失败仍有同步写入失败路径。
- 发布 B 轨仍缺 hosted CI、staging rehearsal、攻击链人工验证、安全签字与灰度观察证据。
