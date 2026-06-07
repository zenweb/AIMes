# Todo：QualityBoard 扫码返工复验放行证据下一步

## 下一片建议

- 质量放行已有正向放行和写入失败两侧 Chromium 证据，后续不应继续在同一点微切片，除非出现真实缺陷。
- 按覆盖率杠杆转向仍低覆盖且用户必经的库存出入库、生产开工/完工、工艺路线或采购收货链路。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/quality.spec.ts`。
- 后续覆盖率刷新时确认 `QualityBoard.vue` / 相关质量面板覆盖率变化。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
