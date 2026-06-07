# AIMes Professional MES UI System

> 日期：2026-05-26  
> 来源：UI/UX Pro Max + Figma-ready 设计系统基线  
> 目标：把“能演示的 AI MES”视觉升级为专业 MES 控制塔，而不是营销型 SaaS 页面。

## 1. 设计定位

AIMes 面向调度、生产、质量、设备、采购和管理人员；页面应优先支持高频扫描、风险判断、动作审批和证据追溯。

本轮采用“专业制造运营控制塔”方向：

- 信息密度高，但层级清楚。
- 避免大面积装饰和营销 hero。
- 以工厂、产线、班次、审计、动作落库为一屏首要信号。
- 颜色表达生产状态：蓝色为计划/信息，绿色为已闭环，琥珀为预警，红色为阻断。

## 2. Figma-ready Tokens

| Token | Value | 用途 |
|---|---:|---|
| `color.bg.default` | `#eef3f8` | 应用背景 |
| `color.bg.grid` | `rgba(15, 23, 42, 0.055)` | 工业网格背景 |
| `color.surface.default` | `#ffffff` | 卡片、面板 |
| `color.surface.raised` | `#f8fafc` | 输入、表头、弱面板 |
| `color.sidebar.default` | `#07111f` | 专业深色侧栏 |
| `color.text.primary` | `#0b1220` | 主文字 |
| `color.text.secondary` | `#5c6b7c` | 次级文字 |
| `color.border.default` | `#d8e2ee` | 普通边框 |
| `color.status.info` | `#1368b4` | 信息、计划、链接 |
| `color.status.success` | `#16a06a` | 闭环、在线、通过 |
| `color.status.warning` | `#c77a05` | 预警、瓶颈 |
| `color.status.danger` | `#c93c37` | 阻断、失败 |
| `radius.panel` | `8px` | 页面面板和卡片 |
| `shadow.panel` | `0 10px 28px rgba(15, 23, 42, 0.08)` | 专业浅阴影 |

## 3. 组件规范

### App Shell

- 左侧 288px 专业导航，包含工厂上下文、模块分组、AI Agent Control 状态。
- 顶部栏显示搜索、当前模块、实时连接、班次、证据链状态和用户操作。
- 页面内容上方固定运行状态 ribbon：现场节拍、OTD 预测、风险队列、动作落库。

### Cards / Panels

- 卡片半径统一 8px。
- 不做卡片套卡片；页面 section 保持全宽或网格。
- KPI 卡使用左边框状态色，避免只靠背景色判断。

### Tables / Dense Data

- 表头使用弱背景和 12px 次级文字。
- 行内操作保留紧凑按钮，优先服务扫描、比较和批量判断。

### States

- `info`: 计划、排产、报告、链接。
- `success`: 通过、在线、闭环、动作落库。
- `warning`: 物料、瓶颈、SLA 风险。
- `danger`: 停机、延期、质量阻断。

## 4. 本轮落地范围

- `src/frontend/src/components/layout/MainLayout.vue`
  - 增加工厂上下文、模块上下文、运行状态 ribbon、审计证据链状态。
  - 导航接入 PrimeIcons，提升模块识别。
- `src/frontend/src/components/layout/MainLayout.css`
  - 建立 MES 专业版 CSS token。
  - 统一应用壳、卡片、表格、输入、状态色和暗色模式。
- `src/frontend/src/components/layout/nav-items.ts`
  - 为全部导航项补充 icon 和专业模块描述。
- `src/frontend/assets/styles/tailwind.css`
  - 调整侧栏宽度和 shell spacing，匹配专业控制塔密度。

## 5. 后续 Figma 工作

当前会话未暴露 Figma MCP 画布写入工具，因此本轮没有直接创建 Figma 文件。后续接入 Figma MCP 后，建议按以下顺序同步：

1. 建立 Figma variables：颜色、半径、阴影、字体。
2. 建立 App Shell 组件：Sidebar、Topbar、Operation Ribbon。
3. 建立 Data Panel、KPI Card、Status Badge、Evidence Card、Risk Row。
4. 抽取 Dashboard、Scheduling、Audit Replay、Report 四张核心演示 frame。

## 6. Round 2 页面级精修

第二轮不再只做全局外壳，而是把四条主演示链路做成“进入页面即说明专业场景”的工作台首屏：

- Dashboard：新增 `ops-command-hero`，把 OTD 主承诺、风险闭环、设备运行状态和“进入调度台 / 回放证据链”主动作放到首屏。
- Scheduling：新增 `scheduler-pro-hero`，把调度目标、OTD 预测、换线成本、Agent 状态放在甘特图和工作台之前，明确“AI 调度员专业台”的操作语境。
- Audit Replay：新增 `audit-pro-hero` 并精修 `AuditDecisionReplayPanel`，把输入、建议、动作、回放四段证据链变成审计控制台首要信号。
- Report：新增 `report-pro-hero`，把 OTD 提升、延期减少、决策留痕和经营复盘定位前置，强化“Executive Review Pack”演示收束。

本轮页面级 hero 均遵循专业 MES 原则：8px 内卡片半径、状态色左边框/徽标、紧凑 KPI、明确业务对象、避免营销式大留白。

## 7. 验证记录

- `npm run build`（`src/frontend`）：通过；仅有既有 Node `DEP0180 fs.Stats constructor is deprecated` 警告。
- 视觉烟测预览：`http://127.0.0.1:4174/scheduling`。
- Dashboard 首屏截图：`_docs/_review/ui-professional-smoke/dashboard.png`，shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- Audit 首屏截图：`_docs/_review/ui-professional-smoke/audit-logs.png`，shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- Report 首屏截图：`_docs/_review/ui-professional-smoke/report.png`，shell/sidebar/ribbon/module context 均可见，横向溢出 `0`。
- `npm run test:e2e -- scheduling.spec.ts -g "通过后端 API 生成并采纳"`：通过，`1/1`，验证调度员 Agent 工作台主链路在新外壳下仍可生成并采纳推荐。
- Round 2 Dashboard 截图：`_docs/_review/ui-professional-smoke-round2/dashboard.png`。
- Round 2 Scheduling 截图：`_docs/_review/ui-professional-smoke-round2/scheduling.png`，横向溢出 `0`。
- Round 2 Audit 截图：`_docs/_review/ui-professional-smoke-round2/audit-logs.png`，横向溢出 `0`。
- Round 2 Report 截图：`_docs/_review/ui-professional-smoke-round2/report.png`，横向溢出 `0`。
- `npm run test:e2e -- dashboard.spec.ts -g "AI MES 指挥中心"`：通过，`1/1`。
- `npm run test:e2e -- scheduling.spec.ts -g "通过后端 API 生成并采纳"`：通过，`1/1`。
- `npm run test:e2e -- audit.spec.ts -g "后端 Agent execute"`：通过，`1/1`。
- `npm run test:e2e -- report.spec.ts -g "展示 OTD 改善复盘报告"`：通过，`1/1`。
- 视觉烟测接口噪声修复：新增离线演示模式 `VITE_OFFLINE_DEMO=true` 或 `?offlineDemo=true`，该模式下前端不发 `/api/v1/*` 与 `/hubs/*` 请求，页面使用现有 demo fallback；Dashboard、Scheduling、Audit、Report 四页离线烟测结果均为 console 错误/警告 `0`、后端请求 `0`。

备注：历史截图曾因视觉烟测未启动后端而出现 SignalR `/hubs/notifications` 与部分 `/api`、`/reports` 404 console 噪声。当前已通过离线演示模式修复：视觉烟测应使用 `VITE_OFFLINE_DEMO=true` 或访问 URL 追加 `?offlineDemo=true`，避免预览环境误打真实后端；正常联调和 e2e 仍保留真实接口行为。
