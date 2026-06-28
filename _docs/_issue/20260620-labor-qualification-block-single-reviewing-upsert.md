# 2026-06-20 Issue - 人员停工复核重复写入

## 现象
- 员工页点击“主管确认停工复核”后，后端出现同一 `LaborQualificationBlock` 业务键的重复证据记录。
- 重复记录中一条为 `active`，另一条为 `reviewing`，查询结果存在歧义。

## 根因
- 前端 `confirmQualificationReview()` 在没有本地未释放阻断记录时，会通过 `ensureQualificationBlock()` 先调用普通阻断持久化，随后再调用复核持久化。
- 后端 upsert 原先只更新第一条匹配记录，没有清理同 key 历史重复。

## 修复
- 前端复核确认改为构造未持久化候选记录，再由 `writeLaborQualificationBlockReview()` 写入最终 `reviewing`。
- 后端 upsert 查询全部同 key 记录，保留最新一条并删除其余重复。
- 集成测试人工插入重复记录，再验证 upsert 后只剩一条 `reviewing`。

## 状态
- 已修复并通过单测、集成测试、API 收敛验证和真实浏览器验证。
