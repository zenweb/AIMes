# Todo：Staging PASS 后下一步

## 已关闭

- [x] Docker Desktop / Linux engine / Docker API 可用。
- [x] 外部依赖镜像可用。
- [x] PostgreSQL/staging rehearsal PASS。
- [x] Release gate audit 已刷新，staging 子门禁 PASS。

## 仍未关闭

- [ ] Attack Chain A/B/C：需要人工 verifier、timestamp、A/B/C 实测证据。
- [ ] Security signoff：需要人类签署 `Status/Decision = SIGNED`，不能由 Codex 代签。
- [ ] First gray release：需要实际发布动作。
- [ ] Gray observation：需要首个灰度发布后 14 calendar days 且 P0/P1 = 0。

## 不要做

- 不继续把前端/a11y 微切片当作 v1.0.0 发布闸门推进。
- 不伪造安全签字、人工攻防验证或 14 天观察窗口。
