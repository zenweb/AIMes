# 20260619 Purchase Outsourcing Receipt Guidance Links Review

## 范围
- 文件：`src/frontend/src/components/purchase/PurchaseBoard.vue`
- 测试：`src/frontend/tests/unit/purchase-board.test.ts`

## 评审结论
- 外协到货确认会释放排产路径并写入证据链，属于复杂操作；现在已有确认前核对提示。
- 提示覆盖简体中文和英文，满足多语言核心原则。
- 风险、排产、报表和本地帮助入口已做成上下文链接。
- `aria-describedby` 已把面板与帮助提示关联。

## 风险
- 当前帮助入口为面板内锚点，不是独立帮助中心。后续若有统一支持页，可替换为正式帮助路由。
- 浏览器证据使用本地演示外协承诺包注入，目的是让生产预览渲染该既有条件面板；业务写入逻辑未在浏览器中执行。

## 验证
- RED 已确认缺少 `.outsourcing-receipt-guidance` 时目标测试失败。
- GREEN 后目标测试、采购组件测试、全量覆盖率、lint、build 均通过。
- 已取得真实浏览器可见截图：`purchase-outsourcing-receipt-guidance-visible-real-browser-20260619`。
