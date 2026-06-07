# Todo：Gray observation next actions

## 灰度前置

- 完成 Hosted CI。
- 完成 PostgreSQL/staging rehearsal。
- 完成 Attack Chain A/B/C 人工验证。
- 完成 security signoff。

## 灰度执行后

- 填写真实 `GrayReleaseId`。
- 填写 `GrayStartedAt` 和 `ObservationStartedAt`。
- 开始 14 calendar days 观察窗口。
- 观察结束后填写 `ObservationEndedAt`。
- 提供 incident query 或监控证据，证明 P0=0、P1=0。

## 当前禁止动作

- 不得在首次灰度未开始时把 gray observation 改为 PASS。
- 不得把 P0/P1 从 `-1` 改成 `0` 来伪造观察完成。
