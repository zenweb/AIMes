# 2026-06-21 人员停工复核放行单次 released Upsert

## 变更
- 修复人员管理中直接点击“补证改派并重新放行”时，会先写入 `active` 阻断、再写入 `released` 阻断的问题。
- 放行路径现在只构造未持久化候选阻断，并由 `releaseLaborQualificationBlock()` 写入最终 `released` 状态。
- 新增单测断言放行按钮不会调用普通 `writeLaborQualificationBlock()`，避免再次引入中间态持久化。

## 验证
- `npm run test:unit -- tests/unit/skill-matrix-panel.test.ts tests/unit/employee-board.test.ts tests/unit/labor-assignment-sync.test.ts`
- `npm run build`
- 真实浏览器验证：
  - 入口：`http://127.0.0.1:4173/scheduling/employee`
  - 登录：`admin / admin123`
  - 点击“补证改派并重新放行”后只产生 2 个业务 POST：`LaborReassignment=approved` 与 `LaborQualificationBlock=released`。
  - 阻断 POST 不再出现 `status=active`。
  - 页面无 Offline demo、员工列表加载失败、加载失败、请求错误文案。
  - 截图：`src/frontend/output/playwright/labor-qualification-release-single-released-upsert.png`

## 数据库结果
- `LaborQualificationBlock` / `LaborReassignment` 重复组查询返回 0 行。
- `labor-qualification-block-WO-013-heat-treatment` 状态为 `released`。
- `labor-reassignment-release-WO-013-heat-treatment` 状态为 `approved`。
