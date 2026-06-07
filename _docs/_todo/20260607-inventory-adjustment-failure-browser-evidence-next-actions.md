# 2026-06-07 Todo - InventoryBoard 库存盘点失败 Chromium 证据后续

## 下一步

- `InventoryBoard` 库存操作失败族已覆盖出库、调拨和盘点真实浏览器证据；后续优先按覆盖率杠杆转向其他低覆盖且用户必经组件。
- 若继续库存域，应先评估是否存在比库存操作失败更高风险的未覆盖路径，而不是继续做已覆盖路径微切片。
- 在外部环境状态变化后单独推进 B 轨：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0。

## 暂不做

- 不扩展新功能。
- 不把本轮 A 轨 Chromium 绿灯当作发布闸门完成证据。
- 不重复跑 B 轨脚本，除非 CI、staging、Docker registry 或人工签字状态发生变化。
