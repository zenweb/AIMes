# 质量管理 + 设备管理 + 登录认证

## 新增功能

### 质量管理页
- **`frontend/src/components/quality/QualityBoard.vue`** — 质量看板（懒加载 11.5 KB）
  - KPI 卡片：合格率、检验批次、不良率、返工率
  - SPC 趋势图：SVG 折线图，支持表面粗糙度/尺寸公差/硬度切换，UCL/CL/LCL 控制限
  - SPC 异常告警（上升趋势检测 + 建议）
  - 异常告警列表：紧急/严重/一般 三级，支持待处理/调查中/已解决 状态
  - 检验批次表格：过滤（全部/合格/不合格/返工），合格率色标
  - 根因分析滑出面板：可能根因（概率条）、纠正措施、预防措施、分析摘要
  - 后端不可用时全量演示数据
- **`frontend/src/types/quality.ts`** + **`frontend/src/api/quality.ts`** — 类型定义和 API 封装

### 设备管理页
- **`frontend/src/components/equipment/EquipmentBoard.vue`** — 设备管理页（懒加载 14.3 KB）
  - KPI 卡片：运行中/总数、利用率、可动率、待修故障数
  - 设备卡片网格：状态指示灯、利用率进度条（红/黄/绿色标）、类型标签、当前工单
  - 类型/状态过滤
  - 详情滑出面板：4 个 Tab — 概览、健康监控、维护记录、故障诊断
  - 健康监控：健康分（红/黄/绿）、异常参数、预测故障
  - 维护记录：预防性/纠正性分类，费用、备件
  - 故障诊断：输入故障码、AI 诊断原因/依据/步骤/备件/维修时间
  - 后端不可用时全量演示数据
- **`frontend/src/types/equipment.ts`** + **`frontend/src/api/equipment.ts`** — 类型定义和 API 封装

### 用户登录认证
- **后端**: `src/MES.Api/Controllers/AuthController.cs` — `POST /api/v1/auth/login` JWT 登录接口
  - 内置 4 个演示用户（admin/operator/engineer/lead）
  - 返回 JWT token + 角色 + 显示名
- **前端**: `frontend/src/components/auth/LoginPage.vue` — 登录页面
  - 渐变背景 + 居中卡片
  - 用户名密码表单，Enter 提交
  - 演示账号提示表格
  - 登录后跳转 Dashboard
- **`frontend/src/stores/auth.ts`** — Auth store（localStorage 持久化）
- **`frontend/src/router/index.ts`** — 路由守卫（未登录跳转登录页，已登录跳首页）
- **`frontend/src/main.ts`** — Axios 拦截器（自动附加 Bearer token，401 自动跳转登录）
- **`frontend/src/components/layout/MainLayout.vue`** — 顶栏右侧显示当前用户 + 退出按钮

### 导航更新
- 顶栏导航：**生产概览 | 排产甘特图 | 质量管理 | 设备管理**

### 生产报工页
- **`frontend/src/components/production/ProductionBoard.vue`** — 生产报工页面（懒加载 14.9 KB）
  - 左侧工单列表：进度条、状态色标、搜索过滤
  - 右侧工单详情：产品信息、计划/完成数量、进度条
  - 工序卡片列表：开工 / 完工 / 异常 三个操作按钮
  - 开工对话框：选择工位、设备
  - 完工对话框：填写完成数量、不良数量、质检结果
  - 异常上报对话框：描述异常原因
  - 顶部扫码输入框：支持工单号/工序码查询
  - 顶部通知提醒
  - 后端不可用时全量演示数据（6 个工单、各工序数据）
- **`frontend/src/types/production.ts`** + **`frontend/src/api/production.ts`** — 类型定义和 API 封装

### Docker Compose 基础设施
- **`v1/docker-compose.yml`** — 新增 API 服务 + 数据库初始化脚本挂载
  - 5 个服务：postgresql、redis、rabbitmq、qdrant、api
  - 健康检查依赖链（API 等待所有基础设施就绪）
  - 环境变量注入（连接字符串自动指向容器名）
  - 数据库初始化：init.sql（DDL）+ seed.sql（演示数据）
- **`v1/Dockerfile`** — 多阶段构建：dotnet publish + frontend npm build → aspnet final

### CI/CD 基础设施
- **`.github/workflows/ci.yml`** — GitHub Actions CI
  - backend job：dotnet restore → build → test（含 PostgreSQL 容器）
  - frontend job：npm ci → vue-tsc type-check → vite build → Playwright E2E

### SignalR 实时通知系统
- **后端**: `src/MES.Api/Hubs/NotificationHub.cs` — SignalR Hub
  - `[Authorize]` 保护，连接时自动加入角色组和 "all" 组
  - 支持 Subscribe/Unsubscribe 指定频道
- **后端**: `src/MES.Api/Hubs/NotificationService.cs` — 推送服务接口 + 实现
  - 4 种通知类型：设备状态变更、质量预警、生产进度、异常告警
  - DI 注册：`INotificationService` → `NotificationService`
- **后端**: `Program.cs` — 注册 `builder.Services.AddSignalR()` + `MapHub("/hubs/notifications")`
- **前端**: `frontend/src/stores/notifications.ts` — SignalR 客户端连接管理
  - 自动重连（指数退避：0/2s/5s/10s/30s）
  - 4 种通知处理程序 → Toast 消息
  - 3 秒自动消失，最多保留 5 条
- **前端**: `frontend/src/components/notifications/ToastContainer.vue` — 通知 Toast 组件
  - 右上角堆叠显示、成功/警告/错误/信息 四种样式
  - 滑入/滑出动画
- **前端**: `MainLayout.vue` — 集成 ToastContainer + SignalR 连接生命周期
  - 登录后自动连接、登出断开
  - 顶栏实时连接指示灯（绿色脉冲动画）
- **测试**: 新增 AuthControllerTests（4 个测试）、KnowledgeControllerTests（1 个测试）、ProductionControllerTests（3 个测试）

### P0 BOM/工艺路线/异常管理 前后端完成
- **后端**: `BomController.cs`, `RoutingController.cs`, `AnomalyController.cs` — 各 4~8 个 REST API 端点
- **后端**: `BomAppService.cs`, `RoutingAppService.cs`, `AnomalyAppService.cs` — 完整 CQRS 应用服务
- **后端**: `BomDtos.cs`, `RoutingDtos.cs`, `AnomalyDtos.cs` — DTO 定义
- **前端**: `BomBoard.vue` — BOM 列表 + 详情 + 物料表格 + 爆炸展开树（折叠/展开）
- **前端**: `RoutingBoard.vue` — 路线列表 + 工序流程图（垂直连接线 + 参数芯片）
- **前端**: `AnomalyBoard.vue` — 异常卡片列表 + 筛选（全部/紧急/待处理）+ 滑出详情 + AI 分析建议 + 响应记录
- **前端**: 路由注册 `/bom`, `/routing`, `/anomaly` + 顶栏导航链接

### P1 文档上传 + 排产存根
- **前端**: `DocumentUpload.vue` — 拖拽/点击选择文件上传区，支持 PDF/Word/Excel/TXT/MD（最大 50MB），文档分类选择（通用/工艺/质量/设备/标准），文件队列管理（进度条/重试/删除），上传历史记录表
- **前端**: `types/knowledge.ts` + `api/knowledge.ts` — 新增 `DocumentUploadResponse` 类型和 `uploadDocument` API（multipart/form-data）
- **前端**: 路由注册 `/knowledge/documents` + 顶栏导航链接
- **排产存根**: 甘特图页面已就绪（ScheduleBoard + GanttChart + 工具栏 + 指标 + 详情面板 + 冲突检测 + 完整演示数据）

### P2 库存管理
- **后端**: `InventoryController.cs` — 7 个 REST API 端点（dashboard/list/detail/transactions/stock-in/stock-out/transfer/adjust）
- **后端**: `InventoryAppService.cs` — 完整库存服务（入库/出库/调拨/盘点），集成现有 Material 实体 + StockTransaction 领域实体
- **后端**: `TransactionType.cs`, `StockTransaction.cs`, `InventoryDtos.cs` — 领域实体和 DTO
- **后端**: DI 注册 `IInventoryAppService`
- **前端**: `InventoryBoard.vue` — KPI 卡片、物料库存列表（搜索/类型过滤）、库存详情（库存量条形图色标）、入库/出库/调拨/盘点对话框、交易记录时间线
- **前端**: 路由 `/inventory` + 顶栏导航链接

### P2 采购管理
- **后端**: `PurchaseController.cs` — 7 个 REST API（列表/详情/创建/提交/确认/收货/取消）
- **后端**: `PurchaseAppService.cs` — 完整采购订单生命周期管理（草稿→已提交→已确认→部分收货→已完成）
- **后端**: `PurchaseOrder.cs` (AggregateRoot), `PurchaseOrderLineItem.cs`, `PurchaseOrderStatus.cs`, `PurchaseDtos.cs`
- **前端**: `PurchaseBoard.vue` — 采购订单列表（状态色标）、详情面板（供应商信息+金额）、订单状态流转按钮（提交/确认/收货/取消）、物料明细表（已收/未收）、新建订单对话框（动态行编辑）、收货对话框
- **前端**: 路由 `/purchase` + 顶栏导航链接

### P2 人员管理
- **后端**: `EmployeeController.cs` — 6 个 REST API（列表/详情/按班组/创建/更新/离职）
- **后端**: `EmployeeAppService.cs` — 员工 CRUD，内置 8 个演示员工数据
- **后端**: `Employee.cs` (领域实体), `EmployeeDtos.cs`
- **前端**: `EmployeeBoard.vue` — 员工卡片网格（头像+角色/班组/班次标签）、搜索/角色/班组/显示离职过滤、编辑/新建/离职对话框
- **前端**: 路由 `/employee` + 顶栏导航链接

### P2 系统管理
- **后端**: `AdminController.cs` — 5 个 REST API（用户列表/创建/更新、配置列表/更新），`[Authorize(Roles = "Admin")]` 保护
- **后端**: `AdminAppService.cs` — 用户 CRUD + 系统配置管理，内置 5 个演示用户和 6 项系统配置
- **后端**: `SystemUser.cs`, `SystemConfig.cs`, `AdminDtos.cs`
- **前端**: `AdminBoard.vue` — 三 Tab 页面：**用户管理**（表格+搜索+新增/编辑/启用禁用）、**角色权限**（角色描述矩阵）、**系统配置**（按分类分组，内联编辑保存）
- **前端**: 路由 `/admin` + 顶栏导航链接

### P2 报表中心
- **后端**: `ReportController.cs` — `GET /api/v1/report/dashboard` 聚合生产/质量/设备/异常数据
- **后端**: `ReportDtos.cs` — 报表 DTO 定义
- **前端**: `ReportBoard.vue` — 生产概况（工单数/准时率 + 日产量折线图）、质量概况（合格率/不良率 + 缺陷趋势折线图）、设备概况（利用率柱状图）、异常分布（类型柱状图），全部 SVG 自绘
- **前端**: 路由 `/report` + 顶栏导航链接

### E2E 测试
- **更新**: `dashboard.spec.ts` — 适配新导航数量
- **新增**: `modules.spec.ts` — 覆盖 9 个模块页面的渲染验证（BOM/工艺路线/异常/库存/采购/人员/系统管理/报表/文档上传/排产甘特图），含登录前置条件

总测试数：**132**（114 单元 + 18 集成），全部通过。

### P0 数据持久化（EF Core 配置 + 迁移）
- **`src/MES.Infrastructure/Data/MesDbContext.cs`** — 新增 5 个 DbSet：StockTransactions、PurchaseOrders、Employees、SystemUsers、SystemConfigs
- 新增 Fluent API 配置：
  - `StockTransaction` → `stock_transactions` 表，枚举字串转换，索引 material_code/transaction_type/created_at
  - `PurchaseOrder` → `purchase_orders` 表（AggregateRoot），Version 并发令牌，Items 一对多（Cascade），索引 order_number(唯一)/supplier_name/status
  - `PurchaseOrderLineItem` → `purchase_order_items` 表，独立 HasKey+表映射
  - `Employee` → `employees` 表，索引 employee_number(唯一)/team/role
  - `SystemUser` → `system_users` 表，索引 username(唯一)
  - `SystemConfig` → `system_configs` 表，索引 config_key(唯一)
- 种子数据：3 员工（张三/李四/王五）、2 系统用户（admin/operator1）、3 系统配置（站点名称/早班时间）
- **新迁移** `20260512051801_AddInventoryPurchaseEmployeeAdmin` — 创建上述 6 张新表
- 全量构建 0 错误，132 测试通过，前端 0 TS 错误

### P1 测试覆盖 — 新模块单元测试 + 集成测试
- **新增单元测试** (`MES.Tests.Unit`，+38 个)：
  - `InventoryAppServiceTests` (9 tests) — Dashboard/CRUD/StockIn/StockOut/Transfer/Adjust/异常路径
  - `PurchaseAppServiceTests` (12 tests) — 完整生命周期 Draft→Submitted→Confirmed→PartiallyReceived→Completed/Cancelled + 异常路径
  - `EmployeeAppServiceTests` (10 tests) — CRUD/Deactivate/GetByTeam/异常路径，使用独立测试数据避免静态状态冲突
  - `AdminAppServiceTests` (7 tests) — User CRUD、Config CRUD/异常路径，使用独立测试数据
- **新增集成测试** (`MES.Tests.Integration`，+27 个)：
  - `InventoryControllerTests` (5 tests) — Dashboard/GetAll/GetByCode(404)/StockIn(400)/Transactions
  - `PurchaseControllerTests` (7 tests) — Create/GetById/SubmitConfirm/Receive/Cancel + 状态流转
  - `EmployeeControllerTests` (6 tests) — GetAll/GetById/Create/Update/Deactivate/GetByTeam
  - `AdminControllerTests` (5 tests) — GetUsers/CreateUser/UpdateUser/GetConfigs/UpdateConfig
  - `ReportControllerTests` (3 tests) — GetDashboard/所有 Section/Production 数值验证
- 总测试数：**197**（152 单元 + 45 集成），全部通过
- 前端 0 TS 错误

### SchedulingAgent 集成完成（2C-5）
- **`src/MES.AI/Agents/SchedulingAgent.cs`** — `OptimizeScheduleAsync` 改为 virtual 以支持单元测试 Mock
- **`tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs`** — 完善 Mock，新增 2 个测试
  - `OptimizeScheduleAsync_ShouldCallAgentAndSavePlan` — 验证 Agent 调用、计划保存、结果映射
  - `OptimizeScheduleAsync_WithWorkOrderIds_ShouldUseSpecifiedOrders` — 验证指定工单 ID 的排产流程
  - 修复构造函数：用真实 Mock 对象（Kernel/ILlmGateway/ISchedulingContextProvider/ISchedulingRuleEngine/IConstraintValidator）替代 null!
  - 共 8 个测试全部通过
