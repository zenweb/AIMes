# Phase 2D — 甘特图前端 (MVP)

## 新增项目
- `frontend/` — Vue 3 + TypeScript + Vite 前端项目

## 目录结构
```
frontend/
├── package.json, vite.config.ts, tsconfig.json, index.html
└── src/
    ├── main.ts                       # 入口
    ├── App.vue                       # 根组件
    ├── env.d.ts                      # 类型声明
    ├── router/index.ts               # 路由（/scheduling -> ScheduleBoard）
    ├── types/scheduling.ts           # DTO 类型定义
    ├── api/scheduling.ts             # API 封装（axios）
    ├── utils/gantt-mapper.ts         # DTO -> dhtmlx-gantt 数据映射
    ├── components/
    │   ├── gantt/
    │   │   ├── GanttChart.vue        # dhtmlx-gantt 核心封装
    │   │   └── GanttToolbar.vue      # 工具栏（优化/刷新/时间刻度）
    │   ├── schedule/
    │   │   ├── ScheduleBoard.vue     # 主视图（数据加载 + 子组件编排）
    │   │   ├── ScheduleMetrics.vue   # 指标卡片（利用率/准时率/换线时间/批次）
    │   │   └── OrderDetailPanel.vue  # 工单详情侧边面板
    │   └── layout/
    │       └── MainLayout.vue        # 全局布局（顶栏 + 内容区）
    └── assets/styles/
        └── gantt-overrides.css       # 甘特图样式覆写
```

## 功能
- 排产甘特图可视化（按设备分组展示工单 bar）
- 拖拽调整（锁定周期内工单不可拖拽）
- 依赖关系箭头（完成-开始）
- 自定义 tooltip（工单/设备/时间/冲突信息）
- 时间刻度切换（日/周/月）
- 指标卡片（利用率/准时率/换线时间/批次组数）
- 工单详情侧边面板（点击 bar 弹出）
- 排产优化按钮（调用后端 API）
- 演示模式（后端不可用时展示示例数据）

## API 依赖（需后端运行）
- GET /api/v1/scheduling/current
- GET /api/v1/scheduling/plans
- POST /api/v1/scheduling/optimize
- GET /api/v1/equipment
- GET /api/v1/scheduling/workorders/{id}

## 启动方式
```bash
cd frontend && npm run dev
# 访问 http://localhost:5173/scheduling
```
