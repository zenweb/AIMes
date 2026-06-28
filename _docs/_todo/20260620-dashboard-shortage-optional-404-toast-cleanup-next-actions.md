# 2026-06-20 Todo - Dashboard 短缺证据 optional 404 toast 后续

## 下一步
- 继续按真实浏览器扫查顺序处理仍有 `请求错误` 的页面：
  - `/scheduling/scheduling`
  - `/scheduling/risk`
  - `/scheduling/bom`
  - `/scheduling/purchase`
- 每片都先定位具体 API 合同，再补测试，避免把真实后端失败误静默。
- 保持首屏 Dashboard 作为回归入口，每轮修复后都验证无 toast、无 offline skip、无误导性 fallback 文案。

