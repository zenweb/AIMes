# 2026-06-20 全站真实浏览器 Clean Sweep

## 变更
- 完成 19 个核心路由真实浏览器扫描。
- 复扫确认 API 与 SignalR hub 请求无 4xx/5xx。
- 页面未出现 `Offline demo mode skipped backend request`、`加载失败`、`请求错误`、`API 返回了 HTML fallback`。

## 覆盖路由
- `/dashboard`
- `/risk`
- `/scheduling`
- `/quality`
- `/equipment`
- `/production`
- `/bom`
- `/routing`
- `/anomaly`
- `/knowledge/documents`
- `/inventory`
- `/purchase`
- `/employee`
- `/admin`
- `/barcode`
- `/scanner`
- `/audit-logs`
- `/report`
- `/monitoring`

## 验证
- 登录：`admin / admin123`
- 前端：`http://127.0.0.1:4173/scheduling`
- 后端：`http://127.0.0.1:5003`
- 扫描结果：19/19 路由 `errors=[]` 且 `pageFlags=[]`。
