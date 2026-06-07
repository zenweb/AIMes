# 2026-06-06 Audit Replay OTD 本地证据链损坏后续

- 继续按覆盖率杠杆选择低覆盖且用户必经组件，不回到已 100% 覆盖的 LoginPage 精修。
- 单独审计 `package.json` / `package-lock.json` 的既有脏差异，确认 Nuxt CLI 入口和 lockfile 版本是否需要收口。
- 为其他本地审计证据载荷补同类 fail-loud 浏览器证据，优先选择会影响发布证据链的 key。
- B-track 单独推进 Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天观察窗口。
