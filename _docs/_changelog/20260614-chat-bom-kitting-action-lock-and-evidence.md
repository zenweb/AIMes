# 2026-06-14 ChatPanel BOM 齐套动作锁定与证据链

## 变更
- `ChatPanel.vue` 在 BOM 展开齐套检查包动作成功后，自动锁定该动作按钮，避免重复执行。
- 保持 BOM 齐套包生成、OTD 证据写入和导航联动不变。
- 新增单测覆盖成功后重复点击不再重复写入证据。
- 在真实浏览器的 ChatPanel 业务问答链路中补充按钮锁定断言。

## 验证
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "可执行动作：生成 BOM 展开齐套检查包并同步库存排产和审计" --project=chromium`
- `npm run test:unit:coverage`

