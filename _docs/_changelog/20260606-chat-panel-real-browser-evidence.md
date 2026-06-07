# 20260606 ChatPanel 真实浏览器证据

## 更新

- 刷新 `ChatPanel` 真实 Chromium e2e 证据。
- 确认 `tests/e2e/chat.spec.ts` 在生产构建后 32/32 通过。
- 记录 `ChatPanel` 已具备较高密度浏览器证据，下一片应按覆盖率杠杆转向低覆盖且用户必经的组件。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/chat.spec.ts
```

- Nuxt production build 成功。
- Chromium：32 passed。
- 最大 JS chunk：817.50 kB。

## 未关闭事项

- 未关闭 Hosted CI。
- 未关闭 PostgreSQL/staging 演练。
- 未关闭 Attack Chain A/B/C 人工验证。
- 未关闭安全签字。
- 未关闭首次灰度和 14 天 P0/P1 观察窗口。
