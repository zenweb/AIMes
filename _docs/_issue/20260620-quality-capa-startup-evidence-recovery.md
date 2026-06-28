# Issue: 质量页启动证据失败与可选 latest 404 toast

## 现象
真实浏览器进入 `/scheduling/quality` 时，页面出现两个全局请求错误 toast：`Request failed with status code 404`。

## 根因
- `quality-mrb-disposition/latest` 与 `risk-sla-review/latest` 是可选 latest 读取；后端暂无记录时返回 404。
- API helper 会 catch 并返回 null，但统一 HTTP 响应拦截器已先弹出全局错误 toast。
- `QualityCapaTaskPanel` 启动读取多个后端证据源时缺少边界处理，任一失败存在初始化挂起/未处理风险。

## 修复
- `QualityCapaTaskPanel` 启动读取改为逐源恢复，真实失败聚合告警，offline demo skip 静默。
- HTTP 层支持 `suppressErrorToast`，两个可选 latest 读使用该标记。

## 证据
- 单测 5 files / 72 tests passed。
- 构建通过。
- 真实浏览器质量页无 alert toast、无 offline skip、无 CAPA 启动失败。
