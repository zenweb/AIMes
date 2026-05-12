# V1 设计文档重写 + RiskBoard 原型 + 命名空间分层

## 路径 B 执行（审计推荐）

### P0 — 设计文档重构
- 重写 `aimes-design-doc.md` → `aimes-design-doc.v1.md`
  - 从"方向辩论"升级为"V1 落地基线"文档
  - 新增 C4 体系结构视图（Context/Container/Component 三张 Mermaid 图）
  - 新增排程引擎规约（输入合约/优化目标形式化/混合架构契约/性能 SLO）
  - 新增开源/商业功能边界表（V1 冻结）及 MES.AI.Core/Pro 物理分包建议
  - 新增 AI 决策可审计性 4 项不变量
  - 新增部署矩阵（开源单机/开源集群/商业SaaS/商业私有四象限）
  - 新增 V2.0+ 路线规划（明确不做清单）
  - 新增 A1-A5 未消除假设与建议

### P0 — 版本一致性修复
- 项目根 `CLAUDE.md`：`.NET 9` → `.NET 10`
- `task.md`：`.NET 9` badge → `.NET 10`，顶部添加 v4.0 远景横幅 + 指向 V1 设计文档

### P1 — RiskBoard 原型（§5.2 兑现 narrowest wedge）
- 新建 `frontend/src/components/risk/RiskBoard.vue`
  - 4 类风险面板：工单延期风险 / 设备故障预警 / 物料齐套风险 / 产能瓶颈预警
  - 风险概览 KPI（严重/一般/正常/监控总数）
  - 风险行含进度条、状态标签、风险详情
  - 暗色模式兼容
- 路由 `/risk` 注册，导航栏"风险预警"入口

### 命名空间分层（A1 决策落地）
- Core 命名空间：`MES.AI.Core.Scheduling`（规则引擎 11 文件）+ `MES.AI.Core.Models`（SchedulingModels）
- Pro 命名空间：`MES.AI.Pro.Agents`、`MES.AI.Pro.Services`、`MES.AI.Pro.Skills`、`MES.AI.Pro.Configuration`、`MES.AI.Pro.Models`
- 单体项目保留（不拆 .csproj），发布前再机械搬文件
- 同步更新：MES.Api 5 处、MES.Application 5 处、测试 5 处的 using 引用

### 决策记录
- A1（Core/Pro 分包）→ **同意**（先行命名空间分层）
- A3（开源协议）→ **Apache-2.0**
- A5（LLM Provider）→ **Ollama 本地化优先**

## 验证
- 后端编译：0 Errors
- 前端 TypeScript 类型检查：通过（0 Errors）
- Vite 生产构建：成功（6.73s）
- 单元测试：152/152 通过
- 集成测试：45/45 通过
