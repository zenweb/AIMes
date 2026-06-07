# Plan: RiskActionQueuePanel 风险 SLA 复核 fail-loud

## Success Criteria

- 写入失败时不产生未处理 Vue event error。
- 生成失败时显示 alert，空态仍在，不能伪造复核卡或“已生成”留痕。
- 闭环失败时显示 alert，原复核状态仍在，不能伪造“已闭环”留痕。
- 至少一条真实 Chromium 证据覆盖用户入口。

## Result

- 单测：`risk-action-queue-panel.test.ts` 10/10 passed。
- 真实浏览器：`risk.spec.ts -g "风险 SLA 晨会复核包写入失败"` Chromium 1/1 passed。

## Next

- 继续按覆盖率杠杆选择下一个用户关键低覆盖切片。
- B 轨发布闸门保持单独追踪。
