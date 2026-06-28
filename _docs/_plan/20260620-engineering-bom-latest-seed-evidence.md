# 2026-06-20 Plan - 工程与 BOM latest 证据种子恢复

## 成功标准
- `/bom-kitting-package/latest` 返回 200。
- `/alternate-material-approval/latest` 返回 200。
- `/engineering-change-impact/latest` 返回 200。
- `/route-capability-validation/latest` 返回 200。
- scheduling 真实浏览器页面无 4xx 背景请求。

## 执行
1. 真实浏览器复核 scheduling 剩余 404。
2. 读取 DTO、service、key 规则和现有 response helper。
3. 新增失败集成测试。
4. 补集成测试种子与 Docker SQL。
5. 执行 SQL，验证 API，复扫真实浏览器。

## 状态
- 已完成并验证。
