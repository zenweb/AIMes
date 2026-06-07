# Review: DocumentUpload 知识复核真实浏览器证据

## 结论

新增失败态用例有效，未发现本轮新增用例自身的问题。

## 已核对

- 失败注入只针对 `aimes_knowledge_governance_reviews`，不会影响登录态和其他本地证据键。
- 断言覆盖用户可见 alert，而不是只检查内部状态。
- 断言失败后不更新文档版本、索引状态和上传历史，符合 fail-loud 规则。
- 新增用例在生产构建后的 Chromium 中通过。

## 残余风险

- 整份 `knowledge.spec.ts` 已在后续复跑中 15/15 passed。
- 发布 B 轨仍未关闭：Hosted CI、PostgreSQL/staging、攻击链人工验证、安全签字、14 天灰度观察仍缺证据。
