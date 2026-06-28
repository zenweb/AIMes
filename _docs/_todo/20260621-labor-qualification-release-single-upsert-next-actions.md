# 2026-06-21 Todo - 人员停工复核放行后续

## 已完成
- 放行按钮不再持久化 `active` 中间阻断。
- 放行真实浏览器链路只写 `LaborReassignment=approved` 与 `LaborQualificationBlock=released`。
- 数据库无人员阻断/替班重复组。

## 后续
- 继续检查人员管理到生产开工的读回链路：生产开工页面应读取 `released` 阻断和 `approved` 替班，并解除对应热处理开工阻断。
- 单独处理 SignalR negotiate 页面跳转噪声，避免真实浏览器扫描长期带着无关错误。
