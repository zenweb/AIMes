# 2026-06-21 Issue - 人员停工复核放行写入 active 中间态

## 现象
- 真实浏览器点击“补证改派并重新放行”时，网络请求出现 3 个业务 POST：
  - `LaborQualificationBlock=active`
  - `LaborReassignment=approved`
  - `LaborQualificationBlock=released`

## 根因
- 放行路径调用 `ensureQualificationBlock()` 默认持久化候选阻断；在没有本地未释放阻断时，会先写入 `active`。

## 修复
- 放行路径改为 `ensureQualificationBlock({ persist: false })`。
- 保留 `releaseLaborQualificationBlock()` 作为唯一写入最终阻断状态的路径。
- 新增单测锁定该行为。

## 状态
- 已修复并通过单测、构建、真实浏览器和数据库验证。
