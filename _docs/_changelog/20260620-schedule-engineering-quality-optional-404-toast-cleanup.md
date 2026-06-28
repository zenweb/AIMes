# 2026-06-20 Schedule 工程/质量 optional 404 toast 清理

## 变更
- `engineeringEvidence` 的 optional latest 读取统一携带 `{ suppressErrorToast: true }`：
  - `alternate-material-approval/latest`
  - `engineering-change-impact/latest`
  - `route-capability-validation/latest`
- `qualityEvidence` 的 optional latest 读取继续携带 suppress toast，并补齐 404 空状态优先级：
  - `quality-rework-impact/latest`
  - `quality-mrb-disposition/latest`
- optional latest 返回 404 时统一解释为“暂无证据记录”并返回 `null`，即使调用方传入 `failLoud: true` 也不弹全局 `请求错误`。
- 非 404 真实后端失败在 `failLoud` 调用中仍会抛出，保持 fail-loud 边界。

## 验证
- `npm run test:unit -- tests/unit/engineering-evidence-api.test.ts tests/unit/quality-evidence-api.test.ts tests/unit/engineering-change-sync.test.ts tests/unit/quality-rework-sync.test.ts tests/unit/quality-mrb-disposition-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/scheduling-api.test.ts`
- `npm run build`
- 真实浏览器验证：
  - `/scheduling/employee`：无 `员工列表加载失败`，无 `Offline demo mode skipped backend request`，`aimes_offline_demo=false`。
  - `/scheduling/scheduling`：optional latest 404 不再产生通用 `Request failed with status code 404` toast；当前仅剩核心 `/scheduling/current` 的 `未找到当前排产计划` 提示。

