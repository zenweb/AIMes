# Next Actions: Monitoring SignalR

日期：2026-06-06

## A 轨道

- [x] 2026-07-05：修复 standalone preview 下 SignalR hub URL 绕开已配置后端目标的问题；`VITE_API_TARGET=http://127.0.0.1:5002` 时浏览器直连 `5002/hubs/...`，不再硬编码 `5003`。证据见 `_docs/_review/20260705-signalr-configured-backend-target.md`。
- [ ] 评估 Monitoring 继续切 reconnecting/reconnected/close 的边际收益。
- [ ] 若边际收益下降，转向下一个低覆盖且用户必经组件。
- [ ] 继续坚持失败路径必须可见、可诊断、可验证。

## B 轨道

- [ ] 补 hosted CI 的 GitHub run URL / run id / job summary。
- [ ] 补 PostgreSQL/staging rehearsal 证据。
- [ ] 补 Attack Chain A/B/C 人工 verifier 与 `VerifiedAt`。
- [ ] 补授权安全签字。
- [ ] 完成首次灰度与 14 个自然日 P0/P1=0 观察窗口。
