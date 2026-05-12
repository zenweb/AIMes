# 2026-05-12 Changelog — 提交累积变更 + RiskBoard 风险预警看板

## 变更清单

### 1. 提交方向3+4累积变更（182文件 → 6个commit）

| Commit | 说明 |
|--------|------|
| `f6932df` | AI排程引擎深化 — 多目标优化 + 采纳反馈 + 性能基准 |
| `65ce2a3` | 认证安全增强 — Refresh Token轮转 + 速率限制 |
| `f766499` | 甘特图前端Phase2D + 全模块看板 |
| `e77a130` | 新增业务模块 + MES.AI命名空间重构（Core/Pro拆分） |
| `f18a62c` | 部署配置 + 设计文档 + Changelog |
| `77cc872` | RiskBoard 风险预警看板 |

### 2. RiskBoard 风险预警看板

**后端：**
- RiskController (`GET /api/v1/risk/dashboard`)
- RiskAppService + IRiskAppService（含演示数据 fallback）
- RiskDtos（4种风险分类DTO + 计数DTO）

**前端：**
- RiskBoard.vue — 完整重构：API接入 + 加载/错误状态 + 演示数据回退
- 4个风险分类面板：工单延期 / 设备故障 / 物料齐套 / 产能瓶颈
- 路由 `/risk` 已于之前的实现中配置
- MainLayout 导航链接「风险预警」

### 验证

- 前端 `vite build` 构建成功，0错误
- 后端 dotnet build 通过
- 工作目录干净，无未提交文件
