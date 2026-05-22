# 2026-05-23 AI 生产助手异常处置执行包

## 背景

`AI 生产助手` 的“创建异常处置卡”原先主要完成权限提示、页面跳转和普通审计留痕，业务上仍然偏薄。这个切片把它升级为真正的跨模块异常处置执行包，让聊天动作可以落到异常、风险、排产、OTD 证据链和审计回放。

## 变更

- 新增 `assistant-anomaly-card-sync.ts`，写入 `aimes_assistant_anomaly_packages`，固化 `CNC-001 主轴温升异常处置卡` 的影响工单、设备、工序、负责人、截止时间和分流动作。
- 聊天执行 `create_anomaly_card` 时同步写入：
  - `aimes_production_anomaly_event`
  - `aimes_anomaly_dispatch_records`
  - OTD `生产异常` 证据：`TRACE-PROD-ANOMALY-CHAT-CNC001-20260522`
  - OTD `助手异常处置` 证据：`TRACE-CHAT-ANOMALY-CNC001-TEMP-20260522`
- 聊天面板展示异常处置执行包卡片，保留审计号 `AUD-CHAT-ANOMALY-20260522-001` 和统一追踪号。
- 审计回放把 `create_anomaly_card` 识别为专属助手异常处置路径，展示异常中心写入、风险升级、AI 排产冻结复核和设备维护确认。
- e2e 覆盖聊天执行后进入异常中心、风险队列、AI 排产事件队列和审计回放。

## 验证

- `VITE_SHOW_DEMO_HINTS=true node ./node_modules/nuxt/bin/nuxt.mjs build`：passed。
- `node ./node_modules/@playwright/test/cli.js test tests/e2e/chat.spec.ts -g "创建异常处置卡" --reporter=list --workers=1 --retries=0`：1 passed。
