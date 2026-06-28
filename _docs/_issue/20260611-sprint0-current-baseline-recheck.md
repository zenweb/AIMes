# Issue：2026-06-08 前端 e2e 旧红需要当前复核

## 状态

已复核，通过。

## 背景

2026-06-08 Sprint 0 基线记录中，前端 e2e 曾为 `345 passed / 13 failed`，失败集中在 Admin、Audit、Chat、Report。当前工作树已有大量后续修复和证据刷新，不能继续引用旧红作为当前状态，也不能直接引用旧绿作为当前完成。

## 处理

- 单独复核旧红区：
  - admin/audit：67 passed
  - chat/report：52 passed
- 追加全量 Chromium e2e：
  - 361 passed

## 结论

旧红区在当前工作树已清掉。唯一遇到的问题是并行 e2e 抢占 `4173` 端口，改用独立端口后通过。

