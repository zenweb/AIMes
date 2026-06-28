# Frontend E2E Modules Offline Demo Pass - 2026-06-21

## Scope
- 全模块离线演示 smoke 验证。
- 目标是确认主要前端入口在 `?offlineDemo=1` 下可渲染，并且不暴露后端 skip / HTML fallback / 请求错误等技术文案。

## Verification
- Command:
  - `npm run test:e2e -- tests/e2e/modules.spec.ts`
- Result:
  - PASS: 12/12 Chromium tests.

## Covered Entries
- 排产甘特图
- 质量管理
- 风险预警
- 人员管理
- 设备管理
- 库存管理
- 报表中心
- 条码打印
- 条码扫描
- 文档上传
- 审计日志
- 实时监控

## Negative Assertions
- No `Offline demo mode skipped backend request`.
- No `API 返回了 HTML fallback`.
- No `请求错误`.
- No unintended `加载失败` alert in covered smoke paths.
