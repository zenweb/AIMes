# 20260518 — V1 宣传画册 PPT

## 新增

- `v1/_docs/_marketing/20260518-AIMes-V1-宣传画册.html` — V1 推广宣传单文件画册（HTML PPT，16:9）

## 设计要点

- **形式**：单 HTML 文件 + ECharts CDN，浏览器直开，支持键盘 ←/→ 翻页、Space 下一页、Home/End、F 全屏、P 打印 PDF
- **风格**：深色科技感 + 玻璃拟态 + Bento Grid + 渐变光晕，Inter / JetBrains Mono / Noto Sans SC 字体栈
- **页数**：14 页（封面 / 痛点 / 定位 / 能力总览 / 排程引擎 / 多目标 / 业务模块 / 架构 / 决策追溯 / 质量性能 / 开源 vs 商业 / 路线图 / 快速启动 / CTA）
- **图表**：7 张 ECharts 数据可视化
  - p4 六维能力雷达（AIMes vs 传统 MES 对比）
  - p5 设备分组甘特（custom render，含瓶颈虚线）+ 规则引擎 vs 人工排产柱状对比
  - p6 四目标 Pareto 雷达（DueDate / Util / Co / Balanced）
  - p9 30 天采纳/调整/拒绝 堆叠柱状
  - p10 测试覆盖环形饼图 + 性能基准平滑折线（订单数 vs 耗时，规则 vs LLM 精调）
- **架构图**：纯 SVG 手绘四层（Presentation / API / Domain / Infrastructure）
- **辅助图形**：CSS 动画轨道环（封面 + CTA）、流水线步骤、玻璃卡片 KPI、终端风格 Quickstart

## 内容来源

- README、CHANGELOG（v0.1.0）、commercial-vs-opensource.md、aimes-design-doc.v1.md
- 数据均基于 V1 已落地能力：197 测试 / 4 目标函数 / 13+ 模块 / 5 容器一键启动

## 用法

- 直接浏览器打开 `.html` 文件即可演示
- 投屏／打印为 PDF：按 `P` 或浏览器打印对话框选择「保存为 PDF」
- 替换占位：`YOUR_ORG / YOUR_EMAIL / YOUR_WECHAT_*`（最后一页 CTA 三处）

## 已知边界

- ECharts 走 CDN，离线场景需替换为本地 `echarts.min.js`
- 雷达图的「传统 MES 4.0 分」是行业经验值估算，非实测对比
