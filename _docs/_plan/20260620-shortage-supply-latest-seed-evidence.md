# 2026-06-20 Plan - 缺料与供应 latest 证据种子恢复

## 成功标准
- dashboard 不再因 `shortage-risk-resolution/latest` 出现 404。
- scheduling 中 shortage/supply/supplier 四条 latest 请求返回 200。
- purchase 中 supply/supplier 两条 latest 请求返回 200。
- 页面不出现 `请求错误`、offline skip 或本地 fallback。

## 执行
1. 真实浏览器扫描确认剩余 404。
2. 读取 DTO、service、upsert key 与现有测试类型。
3. 新增失败集成测试锁定四个 latest endpoint。
4. 补集成测试种子与 Docker SQL。
5. 执行 SQL、验证 API、复扫真实浏览器。

## 状态
- 已完成并验证。
