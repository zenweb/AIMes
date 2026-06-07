# 2026-06-05 Integration Performance WorkOrder Validation Review

## 审计结论
- 批量创建工单性能测试原本造出了非法样本：首条请求的 `PlannedStartDate` 与 `PlannedEndDate` 相等，直接命中请求校验，导致集成测试稳定返回 400。
- 这不是业务实现问题，是测试数据本身违背了请求约束。
- 已将性能测试的结束日期整体后移 1 天，确保批量样本满足 `PlannedStartDate < PlannedEndDate`。

## 结果
- 后端全量测试重新验证通过。
- 前端 build / lint / unit 通过。
- 前端 E2E 通过；`admin.spec.ts` 的首个治理用例在全量跑中曾出现一次启动期 flaky，复跑 `admin.spec.ts` 全文件 30/30 通过，暂时判断为一次性抖动。

## 残余风险
- 该 admin E2E 抖动目前没有稳定复现路径，先保留为运行时记录，不继续烧时间。
