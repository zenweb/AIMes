# 20260619 Purchase Outsourcing Receipt Guidance Links

## 变更
- 在采购协同的外协承诺到货确认区新增中英双语操作提示。
- 增加相关入口：风险预警、AI 排产、报表证据、帮助。
- 将外协到货确认面板通过 `aria-describedby="outsourcing-receipt-help"` 关联到操作提示。

## 验证
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "guides outsourcing receipt"`：通过。
- `npm run test:unit -- tests/unit/purchase-board.test.ts`：36 个测试通过。
- `npm run test:unit:coverage`：111 个文件、1102 个测试通过。
- `npm run lint`：通过。
- `npm run build`：通过。
- 真实浏览器证据：`purchase-outsourcing-receipt-guidance-visible-real-browser-20260619`。

## 备注
- 真实浏览器路由带 `/scheduling/` 前缀，这是当前 Nuxt baseURL 行为。
