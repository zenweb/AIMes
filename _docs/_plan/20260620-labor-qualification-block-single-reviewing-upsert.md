# 2026-06-20 Plan - 人员停工复核单次 reviewing Upsert

## 目标
- “主管确认停工复核”必须只产生一条业务阻断记录，最终状态为 `reviewing`。
- 历史重复 `LaborQualificationBlock` 记录必须在下一次 upsert 时自动收敛。
- 员工页必须保持真实后端模式，不回落到 Offline demo 示例数据。

## 步骤
1. 复现并确认重复写入：真实浏览器点击复核按钮后出现两条同 key 记录。
2. 修改前端复核路径，让确认复核只写最终 `reviewing` 状态。
3. 修改后端 upsert，让同一 `EvidenceType + EvidenceKey` 的历史重复记录收敛为单条。
4. 增加前端单测和后端集成测试。
5. 重建 API，使用正式 API 收敛旧数据。
6. 用真实浏览器验证登录、员工页、复核按钮、网络请求数量和数据库最终状态。

## 成功标准
- 点击一次“主管确认停工复核”只发 1 个 `POST /api/v1/scheduling/labor-qualification-blocks`。
- POST payload 为 `status=reviewing`。
- 数据库中 `LaborQualificationBlock` 重复组为 0。
- 目标业务键只剩 1 条 `reviewing`。
- 页面无 Offline demo、员工列表加载失败、加载失败、请求错误文案。
