# 20260518 — V1 宣传画册双线扩展（PPTX + 移动版 H5）

> 派生自 `20260518-v1-marketing-deck.md`，将 V1 推广物料从单一桌面 HTML PPT 扩展为三件套：
> 桌面 HTML PPT · 原生 PPTX · 移动 H5。

## 新增

### 线路 1 — PPTX 全面转换

- `v1/_docs/_marketing/20260518-AIMes-V1-宣传画册.pptx` — 14 页原生 PowerPoint 文件（约 110KB）
- `v1/_docs/_marketing/scripts/build_pptx.py` — 用 python-pptx 生成 PPTX 的可重跑脚本

特点：
- 16:9 大屏（13.333 × 7.5 inch）
- 4 张原生 PPT 图表（雷达 / 柱状对比 / 雷达多目标 / 堆叠柱 / 环形饼 / 折线），保留 PPT 编辑能力
- 用 SHAPE 绘制甘特、流水线、时间轴、终端、轨道环、对比卡片
- 配色复用 H5 版主题（深蓝 #070B1F + 青/蓝/琥珀/粉/紫）
- 中文字体 Microsoft YaHei UI，等宽用 JetBrains Mono
- 14 页全覆盖：封面 / 痛点 / 定位 / 总览 / 引擎 / 多目标 / 模块 / 架构 / Trace / 质量 / 对比 / 路线 / Quickstart / CTA

### 线路 2 — 移动端 HTML5

- `v1/_docs/_marketing/20260518-AIMes-V1-mobile.html` — 移动优先单页画册（约 65KB）

特点：
- **响应式三档**：手机（默认）→ 平板 768px → 桌面 1024px
- **iOS Safe Area** 适配（顶部状态栏 / 底部 Home Bar）
- **滚动揭示动画**：IntersectionObserver 触发 `.reveal.in`
- **顶部进度条**：实时反映滚动位置
- **抽屉菜单**：14 节目录可快速跳转
- **浮动 CTA**：滚过 hero 后底部出现，进入 CTA 区自动隐藏
- **vs 对比 Tab**：开源版/商业版切换
- **复制启动命令**：Quickstart 一键复制 `git clone + docker compose up -d`
- **图表懒加载**：6 张 ECharts 用 IntersectionObserver 进入视口才 init，避免移动端首屏卡顿
- **离线友好**：除字体和 ECharts CDN 外，全部内联

## 三件套用途分工

| 产物 | 场景 | 形态 |
|------|------|------|
| `20260518-AIMes-V1-宣传画册.html` | 大屏演示、客户路演、键盘翻页 | 16:9 桌面 PPT 风 |
| `20260518-AIMes-V1-宣传画册.pptx` | 邮件附件、合作方编辑、转发分享 | 原生 PPT |
| `20260518-AIMes-V1-mobile.html` | 公众号文章、微信打开、手机分享、扫码 | 长卷竖排 H5 |

## 已知边界

- PPTX 中若干 emoji 在某些 Office 版本会以方框显示（依赖系统字体），可手动替换为图标
- 移动版字体与 ECharts 走 CDN，离线场景需替换本地资源
- PPTX 无 H5 的「玻璃模糊 / 辉光」效果，已用半透明叠加近似
- 三个文件共用占位 `YOUR_ORG / YOUR_EMAIL@example.com / _docs/quickstart.md`，发布前替换

## 重新生成 PPTX

```bash
cd v1/_docs/_marketing/scripts
python build_pptx.py
# → ../20260518-AIMes-V1-宣传画册.pptx
```
