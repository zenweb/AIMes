# 20260514 — AIMes V1 Pre-Launch DX 清单

> **状态**：评审完成，待实施
> **来源**：`/plan-devex-review` Pre-Launch 模式（基于实际仓库状态评估）
> **目标 funnel**：自媒体文章 → GitHub → docker compose up → 评估人 → 1/10 转商业版
> **目标 TTHW**：≤ 5 分钟（Champion-tier）
> **当前 Overall DX**：3.75/10
> **Push 前不补不发**

---

## 目标 Persona

```
Who:       工厂 IT / 信息化工程师 / 厂内技术负责人
           （非贡献者，是"评估代理人"）
Context:   读自媒体文章 → 老板说"看看能不能用" → 周末抽 1-2 小时
           本地起来评估 → 周一带截图/演示去汇报
Tolerance: 30-60 min。docker compose up 不一次性跑通 → 关 tab，
           告诉老板"还不成熟"。这次评估窗口可能就再也回不来。
Funnel KPI: 1/10 转商业版（不是 stars，不是 PR）
```

---

## 🚨 评审遗漏的 P0 阻塞项（Codex 发现）

> Codex outside voice 验证发现，前 12 项之外还有 **2 颗 funnel 杀手**——这些是"docker compose up 后浏览器立刻翻车"的根本原因。如果只补前 12 项不修这 2 项，TTHW 5min 目标无法达成。

### 0a. Swagger 在 Production 模式下被禁用（funnel 杀手 #1）

- **What**：`Program.cs:182` 只在 `IsDevelopment()` 时调用 `UseSwagger()`，但 `docker-compose.yml:84` 把 `ASPNETCORE_ENVIRONMENT` 设为 `Production` → 评估人打开 `localhost:5000/swagger` 直接 404
- **Why**：评估人最常做的探索动作就是看 API 文档，404 直接判定"没做完"，关 tab
- **Effort**：CC ~5 min（任选一个修复方案）
- **修复方案**：
  - (a) `docker-compose.yml` 把 `ASPNETCORE_ENVIRONMENT` 改为 `Development` —— 最简单但生产部署有风险
  - (b) **推荐**：`Program.cs` 改为 `if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger"))`，compose 加 `EnableSwagger: "true"`
  - (c) 加专门的 `Demo` 环境枚举，compose 用 `Demo`，开启 Swagger 但保留 Production 安全设置
- **Acceptance**：`docker compose up -d` 后访问 `localhost:5000/swagger` 看到完整 API 列表

### 0b. UseHttpsRedirection 在 compose 里强制重定向到 https（funnel 杀手 #2）

- **What**：`Program.cs:199` 无条件 `app.UseHttpsRedirection()`，docker-compose 只暴露 5000 (http)，浏览器访问 `http://localhost:5000` → 307 重定向到 `https://localhost:5000` → 连接失败 / 证书错误
- **Why**：评估人浏览器一打开就翻车，连看到登录页的机会都没有
- **Effort**：CC ~5 min
- **修复方案**：
  - (a) **推荐**：改为 `if (!app.Environment.IsDevelopment() && !builder.Configuration.GetValue<bool>("DisableHttpsRedirect")) app.UseHttpsRedirection();`，compose 加 `DisableHttpsRedirect: "true"`
  - (b) compose 同时暴露 `8443:443` + 自签证书（复杂）
  - (c) compose 前面加 nginx/traefik 反代（重）
- **Acceptance**：`curl -v http://localhost:5000` 返回 200 而非 307

---

## 阻塞项（不补就不 push）

按"补完直接抬高 5min TTHW"排序。每项含：
- **What**：要做什么
- **Why**：阻塞 funnel 的哪个环节
- **Effort**：CC 协作时间估计
- **Acceptance**：验收标准

### 1. 根 `README.md`（项目门面）

- **What**：仓库根目录的 README，定位 + 截图/GIF + 3 行 quickstart + 链接到 v1/
- **Why**：自媒体读者点 GitHub 第一眼就看到"代码树没 README"——80% 直接关 tab。这是 funnel 顶端最大的漏。
- **Effort**：CC ~30 min（依赖截图就位）
- **Acceptance**：
  - 第一屏可见：项目一句话定位、目标用户、3 步启动
  - 至少 2 张产品截图嵌入（甘特图 + 看板）
  - 顶部有 GitHub badges：license / version / build status
  - 底部有商业版 CTA 区块

### 2. `v1/README.md`（详细 quickstart）

- **What**：v1 目录详细启动指南，含默认账号、端口表、troubleshooting 链接
- **Why**：评估人 cd 进去之后第二次确认"这是不是稳定版"
- **Effort**：CC ~20 min
- **Acceptance**：
  - 默认账号 `admin / admin@123` 显眼标注（含安全警告）
  - 端口表：API 5000 / Postgres 5432 / Redis 6379 / RabbitMQ 5672 / Qdrant 6333
  - "5 分钟内看到甘特图"承诺 + 实测时间
  - 链接到 `_docs/quickstart.md` `_docs/troubleshooting.md`

### 3. `MES.Api/Program.cs` 启动横幅

- **What**：API 启动后打印 ASCII art + 登录 URL + 默认账号 + 文档链接
- **Why**：评估人 docker compose up 后**第一眼就在终端看到"下一步去哪"**——消除"是不是没起来"的不确定感
- **Effort**：CC ~15 min
- **Acceptance**：
  ```
  ╔══════════════════════════════════════════════╗
  ║  AIMes V1 — 智能 MES 系统                    ║
  ╠══════════════════════════════════════════════╣
  ║  ✓ 后端就绪：http://localhost:5000           ║
  ║  ✓ 看板入口：http://localhost:5000/scheduling║
  ║  ✓ API 文档：http://localhost:5000/swagger   ║
  ║  ✓ 默认账号：admin / admin@123                ║
  ║  ✓ 文档：https://github.com/.../blob/main/README.md ║
  ║                                              ║
  ║  💡 商业版？查看 _docs/commercial.md          ║
  ╚══════════════════════════════════════════════╝
  ```

### 4. 根 `/` 路由跳转 `/scheduling`

- **What**：访问 `localhost:5000` 时自动 302 到看板首页（或显示带"立即体验"按钮的着陆页）
- **Why**：消除"猜路径"摩擦点（0B narrative T+2:00）
- **Effort**：CC ~10 min
- **Acceptance**：未登录访问 `/` → 跳登录页；登录后 → 跳排程甘特图

### 5. 产品截图（3-5 张）

- **What**：登录页 / 排程甘特图（带数据）/ 生产看板 / SPC 图 / RiskBoard
- **Why**：自媒体文章和 README 都需要这套素材；评估人没看到截图就不会下载
- **Effort**：人工 ~30 min（要本地起服务截）
- **Acceptance**：
  - 1920x1080 @ 2x DPI
  - 放 `_docs/screenshots/`
  - 文件名：`01-login.png` `02-scheduling-gantt.png` `03-production-board.png` `04-spc-chart.png` `05-riskboard.png`
  - 至少一张做成 5-10 秒 GIF（甘特图拖拽 / 看板刷新）

### 6. `LICENSE` 文件

- **What**：仓库根放完整的 Apache-2.0 LICENSE 文本
- **Why**：开源合规底线，评估人法务过审必查；GitHub License badge 没这个不显示
- **Effort**：CC ~2 min（直接拷贝标准文本）
- **Acceptance**：根目录 `LICENSE` 文件，Apache-2.0 完整文本，版权人=你公司

### 7. 顶层 `CHANGELOG.md`

- **What**：面向用户的发布记录（不是 `_changelog/` 那 26 个开发日记）
- **Why**：评估人判断项目活跃度的第一指标；也为后续 SemVer 打基础
- **Effort**：CC ~15 min
- **Acceptance**：
  - 顶部 `## [v0.1.0] - 2026-05-14` 首发条目
  - 分组：Added / Changed / Fixed / Security
  - 列出 V1 设计文档里的"已落地能力"作为首发亮点

### 8. 商业版 CTA

- **What**：API 启动横幅 + 看板顶部 banner + README 底部 → 三处统一指向商业版咨询
- **Why**：你的 1/10 funnel 命门。评估人喜欢就要立刻知道"还能多干嘛、怎么联系"
- **Effort**：CC ~30 min（含前端 banner 组件）
- **Acceptance**：
  - 看板顶部薄 banner："想要 LLM 多目标 Pareto 优化？查看商业版 →"
  - 链接带 UTM：`?utm_source=opensource&utm_medium=banner&utm_campaign=v0.1`
  - 可关闭（不烦人），关闭状态记 localStorage

### 9. `_docs/quickstart.md`

- **What**：详细启动文档，含先决条件检查、3 步快速启动、第一次使用引导
- **Why**：README 是门面，quickstart 是手册——评估人遇到问题时回这里
- **Effort**：CC ~30 min
- **Acceptance**：
  - 先决条件：Docker Desktop ≥ 4.20 / 8GB RAM / 20GB 磁盘
  - 端口冲突自查：`lsof -i :5432` 等
  - 启动后第一次使用：登录 → 看演示数据 → 创建第一个工单

### 10. `_docs/troubleshooting.md`

- **What**：5-8 个高频问题的诊断+修复
- **Why**：评估人卡 30 秒就关 tab，文档里能搜到答案是关键
- **Effort**：CC ~20 min
- **Acceptance**：覆盖：
  - 5432/6379 端口被占
  - Docker 内存不足导致 pg 启动失败
  - 首次 db init 失败（init.sql/seed.sql 顺序）
  - JWT Signing Key 在生产环境的强制要求
  - 看板空白页（前端构建未挂载）

### 11. `_docs/commercial-vs-opensource.md`

- **What**：开源/商业版功能边界 + 联系方式 + 价值主张
- **Why**：评估人向老板讲故事的弹药；CTA 链接的目的地
- **Effort**：CC ~20 min
- **Acceptance**：
  - 直接复用 `_docs/_design/aimes-design-doc.v1.md` 第 161 行的边界表
  - 商业版独家：LLM 多目标 Pareto / 自学习 / Onnx 视觉 / Qdrant RAG / 私有部署支持
  - 联系方式：邮箱 + 公众号二维码 + 微信群（视实际而定）

### 12. 内部产物迁移到 `_internal/` 或 `.gitignore`

- **What**：移动 `_changelog/cc-sprint-*.md` `_review/` `_research/` 到不外露位置
- **Why**：26 个 AI 协作日记暴露在外，给评估人"还是个 demo 项目"印象
- **Effort**：CC ~15 min（含 git mv + 验证 .gitignore）
- **Acceptance**：
  - 三选一：
    - (a) 移到 `_docs/_internal/` 并加 `.gitignore`
    - (b) 全部 `git rm` 推到独立私仓
    - (c) 用前缀重命名（如 `_internal-changelog/`），让人一眼知道"内部"
  - 推荐 (a)：保留追溯可能性，不污染默认视图

### 13. 错误码 + docUrl 加进 ProblemDetails

- **What**：扩展 `ExceptionMiddleware`，添加 `code` `docUrl` 字段；定义错误码 enum
- **Why**：评估人遇到"密码不能为空"这种 400 时能搜到文档；为后续支持工单提供 trace
- **Effort**：CC ~30 min
- **Acceptance**：
  - 错误码 enum：`AIMES-AUTH-XXX` `AIMES-SCH-XXX` `AIMES-VAL-XXX` `AIMES-RES-XXX`
  - 至少前 5 个高频错误带 docUrl 指向 troubleshooting
  - 错误消息加"可用值/可用状态"后缀（例："工序参数不能为空。必填字段：name, machineId, duration"）

---

## Push 后 30 天 TODO（不阻塞首发，但关键）

按"对 1/10 funnel 转化的影响"排序：

| # | 项 | 优先 | 估计 |
|---|---|---|---|
| 14 | `_docs/architecture.md`（重写自设计文档，去除决策史） | P1 | 1h |
| 15 | docker-compose.lite.yml（轻量评估模式，去掉 redis/rabbitmq/qdrant） | P1 | 30min |
| 16 | TTHW 实测基准 + 匿名遥测端点 | P1 | 2h |
| 17 | EF Core Migrations 启用版本化迁移 | P1 | 3h |
| 18 | `CONTRIBUTING.md`（明确"公司维护，社区贡献以 Issues 形式收集"） | P2 | 30min |
| 19 | GitHub Issue templates（bug / feature / 商业咨询） | P2 | 20min |
| 20 | API 弃用策略文档（`_docs/versioning.md`） | P2 | 30min |
| 21 | OpenAPI 静态导出 + cURL 示例（`_docs/api/`） | P2 | 1h |
| 22 | TypeScript types 包（如要支持 1 周内来对接的前端开发） | P3 | 2h |
| 23 | 错误消息文案改造（全量加"可用值"后缀） | P3 | 2h |

---

## Push 前实施顺序（高 ROI 优先）

```
🚨 第 0 批（~10 min，funnel 杀手必修）
  0a Swagger Production 启用 ----- 5 min  / 否则 /swagger 404
  0b HttpsRedirection 关闭 -------- 5 min  / 否则浏览器 307 翻车

第 1 批（~1.5h，最高 ROI，必须）
  6  LICENSE ----------------- 2 min  / 法务底线
  7  CHANGELOG.md ------------ 15 min / 项目活跃度信号
  3  Program.cs 启动横幅 ----- 15 min / docker compose up 后第一眼
  1  根 README.md ------------ 30 min / GitHub 第一眼
  2  v1/README.md ------------ 20 min / cd v1 后第二眼

第 2 批（~1.5h，关键支撑）
  4  根 / 跳转 --------------- 10 min / 消除猜路径
  9  quickstart.md ----------- 30 min / 评估人手册
  10 troubleshooting.md ------ 20 min / 卡住时的救命绳
  11 commercial-vs-opensource  20 min / CTA 落地页
  12 内部产物迁移 ------------ 15 min / 噪音清理

第 3 批（~1h，funnel 转化）
  8  商业版 CTA --------------- 30 min / 1/10 转化命门
  13 ProblemDetails 错误码 --- 30 min / 评估期问题诊断

需人工配合（异步并行）
  5  产品截图（5 张 + 1 GIF） - 30 min / README 必需素材
```

总计：CC 协作 ~4.2h + 人工截图 ~30min ≈ 5 个工作小时内可完成全部 15 项（含 Codex 发现的 2 颗炸弹）。

---

## DX Scorecard（pre-launch 评估）

```
┌────────────────────┬───────┬─────────────────────────────────────┐
│ Dimension          │ Score │ Note                                │
├────────────────────┼───────┼─────────────────────────────────────┤
│ Getting Started    │  3/10 │ 🔴 阻塞首次评估                      │
│ API/CLI/SDK        │  6/10 │ 🟡 Swagger 基础好，需 demo token     │
│ Error Messages     │  5/10 │ 🟡 结构对，文案缺指引                │
│ Documentation      │  4/10 │ 🔴 内部决策档对外噪音大              │
│ Upgrade Path       │  2/10 │ 🟡 评估期不阻塞，转化后必补          │
│ Dev Environment    │  6/10 │ 🟢 Docker 体验好，建议加 lite 版     │
│ Community          │  3/10 │ 🟡 LICENSE 必补，其他与策略对齐      │
│ DX Measurement     │  1/10 │ 🔴 1/10 funnel 没法验证              │
├────────────────────┼───────┼─────────────────────────────────────┤
│ TTHW               │ 8–∞ min（顺利 8min，翻车无限大）             │
│ 目标 TTHW          │ ≤5 min（Champion-tier）                      │
│ 商业版 CTA         │ 缺失 — 直接关系 1/10 funnel                  │
│ Overall DX         │ 3.75/10                                     │
└────────────────────┴───────┴─────────────────────────────────────┘
```

---

## 决策已确定

| 决策 | 选择 | 时间 |
|---|---|---|
| 目标 persona | 工厂 IT / 评估代理人（非 OSS 贡献者） | 2026-05-14 |
| 转化机制 | A) 明示商业版 CTA（README 顶部 + 看板顶部 + 启动日志） | 2026-05-14 |
| TTHW 目标 | A) ≤ 5 分钟（Champion-tier） | 2026-05-14 |
| Push 前补封范围 | D) 12 项必补 + push 后 30 天 TODO | 2026-05-14 |
| Mode | Pre-Launch Polish | 2026-05-14 |

---

## 验收（Push 标准）

下列条件**全部**满足后才 push 到 GitHub：

- [ ] 12 项阻塞清单全部完成
- [ ] `docker compose up -d` 在干净环境一次成功
- [ ] 浏览器访问 `localhost:5000` → 跳转登录页 → admin/admin@123 登录 → 看到带数据的甘特图，全程 ≤ 5 min（实测）
- [ ] README 在 GitHub 渲染正常（截图加载、链接有效）
- [ ] 商业版 CTA 链接可点击，UTM 参数生效
- [ ] LICENSE 在 GitHub 上正确识别为 Apache-2.0
- [ ] `_changelog/cc-sprint-*.md` 等内部产物已迁移
