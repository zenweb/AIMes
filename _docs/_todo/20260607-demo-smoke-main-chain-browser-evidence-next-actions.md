# 2026-06-07 Demo Smoke 主链路下一步

## 已完成

- Nuxt production build + Chromium 定向验证主链路。
- `Dashboard -> Scheduling -> Audit -> Report` 真实浏览器 PASS。

## 下一步

- 不继续重复精修 Demo Smoke 主链路，除非后续改动影响 Dashboard、Scheduling、Audit 或 Report。
- Docker Desktop Linux engine 可用后，优先复跑 PostgreSQL/staging rehearsal。
- 人工安全验证信息齐备后，复跑 Attack Chain manual verification 和 security signoff。

## 不做

- 不用 A 轨 Chromium PASS 替代 hosted CI、staging、人工 Attack Chain、安全签字或灰度观察。
