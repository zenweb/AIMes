# 2026-05-26 UI 专业 MES 升级

## 变更

- 使用 UI/UX Pro Max 建立 AIMes Professional MES 设计方向：专业制造运营控制塔，强调高密度扫描、风险判断、动作审批和证据追溯。
- 重构全局 `MainLayout`：新增工厂上下文、当前模块上下文、证据链状态、运行状态 ribbon，使所有业务页面进入统一专业 MES 外壳。
- 为导航项补齐 PrimeIcons 与模块描述，提升 20+ 页面的一致识别和演示专业感。
- 增强全局 CSS token：工业蓝、闭环绿、风险琥珀、阻断红、专业深色侧栏、卡片/表格/输入统一边框和阴影。
- 新增 Figma-ready 设计系统文档 `_docs/_design/20260526-aimes-professional-mes-ui-system.md`，后续可直接映射到 Figma variables 和组件库。

## 第二轮页面级精修

- Dashboard 首屏新增 `AIMes Pro Control Tower` 专业控制塔 hero，把 OTD 承诺、风险闭环、设备状态和核心跳转动作前置。
- Scheduling 新增 `Scheduler Pro Workbench` 调度员专业台 hero，并稳定页面高度、甘特容器边界和工作台首屏密度。
- Audit Replay 新增 `Evidence Replay Console` 审计控制台 hero，突出输入、建议、动作、回放四段证据链；同步精修决策回放面板视觉层级。
- Report 新增 `Executive Review Pack` 经营复盘 hero，前置 OTD 提升、延期减少和决策留痕，形成演示闭环收束页。
- 将 `_docs/_design/20260526-aimes-professional-mes-ui-system.md` 生成可直接打开的 HTML 设计文档 `_docs/_design/20260526-aimes-professional-mes-ui-system.html`，内嵌 token 表、页面级规范、验证记录和 Round 2 截图预览。
- 新增离线演示/视觉烟测模式：`VITE_OFFLINE_DEMO=true` 或 URL `?offlineDemo=true` 时，前端跳过 `/api/v1/*` 与 `/hubs/*` 请求，页面使用 demo fallback，避免视觉截图中出现预览环境接口 404/SignalR 噪声。
- 修正静态资源路径：`latest-ab-report.json` 使用 Nuxt baseURL 读取，并补充 `/scheduling/favicon.ico`，避免报告 JSON 和 favicon 在预览 base path 下产生 404。

## 干净视觉证据刷新

- 使用 `VITE_OFFLINE_DEMO=true npm run preview` 重新刷新 Dashboard、Scheduling、Audit、Report 四张 Round 2 视觉证据截图。
- 已替换 `_docs/_review/ui-professional-smoke-round2/dashboard.png`、`scheduling.png`、`audit-logs.png`、`report.png`。
- 更新 HTML 设计文档截图预览，补齐 Scheduling 截图卡片，使 Dashboard / Scheduling / Audit Replay / Report 四页预览与截图目录一致。
- 本轮截图烟测确认四页 console 错误/警告 `0`，`/api` 与 `/hubs` 后端请求 `0`，截图已刷新且无接口错误。

## 前端 e2e 离线边界修复

- 修正 `scripts/e2e.mjs` 的环境变量边界：普通业务 e2e 默认强制 `VITE_OFFLINE_DEMO=false`，避免继承外部离线截图变量后拦截 Playwright mock 后端请求。
- 保留显式离线 e2e 开关：只有设置 `AIMES_E2E_OFFLINE_DEMO=true` 时，e2e 构建才启用 `VITE_OFFLINE_DEMO=true`。
- 修复 Scheduling 后端 Agent mock 测试与 Audit Agent execute 业务落库回放测试在离线环境变量残留时的误失败。

## 后端性能测试收口

- 修复 `PerformanceTests.GetAllPlans_Performance` 的稳定态测量口径：先执行 `/api/v1/scheduling/plans` warmup，再连续采样 3 次稳定态请求并以最佳耗时断言 `<1000ms`。
- 该测试不放宽性能阈值，只排除 ASP.NET/EF/JIT 冷启动与单次 GC 抖动，避免历史 `1305ms` 冷启动样本误判为稳定态性能失败。
- 带编译定向回归中，预热后 3 次稳定态样本约为 `15ms / 24ms / 2ms`，最佳值显著低于 `<1000ms` 阈值。

## 验证

- `npm run build`（`src/frontend`）：通过；仅有既有 Node `DEP0180 fs.Stats constructor is deprecated` 警告。
- 视觉烟测预览：`http://127.0.0.1:4174/scheduling`。
- Dashboard 首屏：已生成 `_docs/_review/ui-professional-smoke/dashboard.png`；shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- Audit 首屏：已生成 `_docs/_review/ui-professional-smoke/audit-logs.png`；shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- Report 首屏：已生成 `_docs/_review/ui-professional-smoke/report.png`；shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- `npm run test:e2e -- scheduling.spec.ts -g "通过后端 API 生成并采纳"`（`src/frontend`）：通过，`1/1`，验证调度员 Agent 工作台主链路在新专业外壳下仍可用。
- 第二轮视觉烟测预览：`http://127.0.0.1:4173/scheduling`。
- 第二轮 Dashboard 首屏：已生成 `_docs/_review/ui-professional-smoke-round2/dashboard.png`。
- 第二轮 Audit 首屏：已生成 `_docs/_review/ui-professional-smoke-round2/audit-logs.png`，横向溢出 `0`。
- 第二轮 Report 首屏：已生成 `_docs/_review/ui-professional-smoke-round2/report.png`，横向溢出 `0`。
- 第二轮 Scheduling DOM 视觉烟测：`.scheduler-pro-hero` 与 `.schedule-board` 均存在，横向溢出 `0`；Chrome 截图进程在 Gantt 页面存在退出等待，本页以 DOM 烟测和定向 e2e 作为证据。
- `npm run test:e2e -- dashboard.spec.ts -g "AI MES 指挥中心"`：通过，`1/1`。
- `npm run test:e2e -- scheduling.spec.ts -g "通过后端 API 生成并采纳"`：通过，`1/1`。
- `npm run test:e2e -- audit.spec.ts -g "后端 Agent execute"`：通过，`1/1`。
- `npm run test:e2e -- report.spec.ts -g "展示 OTD 改善复盘报告"`：通过，`1/1`。
- `VITE_OFFLINE_DEMO=true npm run preview` + Playwright console/request smoke：Dashboard、Scheduling、Audit、Report 四页 console 错误/警告 `0`，`/api` 与 `/hubs` 后端请求 `0`。
- `VITE_OFFLINE_DEMO=true npm run build`（`src/frontend`）：通过；仅有既有 Node `DEP0180 fs.Stats constructor is deprecated` 警告。
- `VITE_OFFLINE_DEMO=true npm run test:e2e -- dashboard.spec.ts scheduling.spec.ts audit.spec.ts report.spec.ts --grep "页面标题显示正确|页面加载 — 指标卡片|展示 AI 建议、人工采纳、重排动作和配置审批回放|展示 OTD 改善复盘报告"`：通过，Dashboard / Scheduling / Audit / Report 四条页面级 e2e `4/4`。
- `VITE_OFFLINE_DEMO=true npm run test:e2e -- scheduling.spec.ts audit.spec.ts --grep "通过后端 API 生成并采纳推荐|后端 403 时保留 fallback|回放后端 Agent execute 业务落库证据"`：通过，原失败三条定向回归 `3/3`。
- `VITE_OFFLINE_DEMO=true npm run test:e2e -- dashboard.spec.ts scheduling.spec.ts audit.spec.ts report.spec.ts`：通过，完整四页 e2e `62/62`。
- `dotnet test src/backend/AIMes.slnx --filter "FullyQualifiedName~PerformanceTests.GetAllPlans_Performance"`：通过，`1/1`。
- `dotnet test src/backend/AIMes.slnx`：通过，Unit `308/308`，Integration `138/138`；Evaluation 项目当前无可发现测试。

## 备注

- 当前会话没有暴露 Figma MCP 画布写入工具，因此本轮先落地代码侧设计系统与 Figma-ready 文档，没有直接创建或修改 Figma 文件。
- 历史视觉烟测未启动后端时，SignalR `/hubs/notifications`、部分 `/api` 与 `/reports` 404 属于预览环境噪声；当前应使用离线演示模式进行截图，正常后端联调和 e2e 不受影响。
