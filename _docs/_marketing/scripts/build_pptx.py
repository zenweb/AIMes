"""
AIMes V1 宣传画册 PPTX 生成器
依赖: python-pptx >= 1.0
输出: ../20260518-AIMes-V1-宣传画册.pptx
"""
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.chart.data import CategoryChartData, XyChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION
from pptx.oxml.ns import qn
from lxml import etree

# ============ 主题色 ============
BG = RGBColor(0x07, 0x0B, 0x1F)
BG2 = RGBColor(0x0A, 0x0E, 0x27)
PANEL = RGBColor(0x12, 0x18, 0x36)
PANEL_2 = RGBColor(0x1A, 0x21, 0x42)
BORDER = RGBColor(0x2A, 0x32, 0x55)
TEXT = RGBColor(0xE8, 0xEB, 0xF5)
TEXT2 = RGBColor(0xA4, 0xAD, 0xC7)
TEXT3 = RGBColor(0x6B, 0x74, 0x94)
C_BLUE = RGBColor(0x4F, 0x8D, 0xFF)
C_CYAN = RGBColor(0x00, 0xE5, 0xC7)
C_AMBER = RGBColor(0xFF, 0xB5, 0x47)
C_PINK = RGBColor(0xFF, 0x6B, 0x9D)
C_PURPLE = RGBColor(0xA7, 0x8B, 0xFA)
C_GREEN = RGBColor(0x4A, 0xDE, 0x80)

# 16:9 大屏 13.333 x 7.5 in
SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H

BLANK = prs.slide_layouts[6]


# ============ 工具函数 ============
def add_rect(slide, x, y, w, h, fill, line=None, shadow=False, corner=None):
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if corner else MSO_SHAPE.RECTANGLE, x, y, w, h)
    if corner is not None:
        shp.adjustments[0] = corner
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(0.75)
    shp.shadow.inherit = False
    return shp


def add_text(slide, x, y, w, h, text, size=14, color=TEXT, bold=False, align="left", font="Microsoft YaHei UI", anchor="top"):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Emu(0)
    tf.margin_top = tf.margin_bottom = Emu(0)
    tf.vertical_anchor = {"top": MSO_ANCHOR.TOP, "middle": MSO_ANCHOR.MIDDLE, "bottom": MSO_ANCHOR.BOTTOM}[anchor]
    p = tf.paragraphs[0]
    p.alignment = {"left": PP_ALIGN.LEFT, "center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT}[align]
    r = p.add_run()
    r.text = text
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return tb


def slide_bg(slide, color=BG):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, SLIDE_H)
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.fill.background()
    bg.shadow.inherit = False
    return bg


def add_glow(slide, cx, cy, size_in, color):
    """近似辉光：用半透明圆形+椭圆叠加"""
    s = Inches(size_in)
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, cx - s / 2, cy - s / 2, s, s)
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    set_fill_alpha(shp, 18)  # 18% 透明
    shp.line.fill.background()
    return shp


def set_fill_alpha(shape, alpha_pct):
    """通过 OOXML 给纯色填充加 alpha (0-100)"""
    sp = shape.fill._xPr
    solidFill = sp.find(qn('a:solidFill'))
    if solidFill is None:
        return
    srgb = solidFill.find(qn('a:srgbClr'))
    if srgb is None:
        return
    alpha = srgb.find(qn('a:alpha'))
    if alpha is None:
        alpha = etree.SubElement(srgb, qn('a:alpha'))
    alpha.set('val', str(int(alpha_pct * 1000)))


def add_topbar(slide, section, page_no, total):
    add_rect(slide, Inches(0.55), Inches(0.28), Inches(0.18), Inches(0.18), C_BLUE, corner=0.3)
    add_text(slide, Inches(0.78), Inches(0.22), Inches(3.5), Inches(0.3),
             "AIMes · Industrial AI MES", size=11, color=TEXT2)
    add_text(slide, Inches(8.5), Inches(0.22), Inches(4.5), Inches(0.3),
             f"{section}    ·    {page_no:02d} / {total:02d}", size=11, color=TEXT3, align="right")


def add_footer(slide, total, idx):
    add_text(slide, Inches(0.55), Inches(7.1), Inches(7), Inches(0.3),
             "AIMes V1 · 智能制造执行系统 · 宣传画册 · 2026.05", size=10, color=TEXT3)
    add_text(slide, Inches(7.5), Inches(7.1), Inches(5.3), Inches(0.3),
             "v0.1.0 · Apache 2.0", size=10, color=TEXT3, align="right")
    bar_w = Inches(13.333) * (idx / total)
    pb = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.45), bar_w, Inches(0.05))
    pb.fill.solid()
    pb.fill.fore_color.rgb = C_CYAN
    pb.line.fill.background()


def eyebrow(slide, x, y, text, color=C_CYAN):
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y + Inches(0.07), Inches(0.3), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = color
    line.line.fill.background()
    add_text(slide, x + Inches(0.4), y, Inches(8), Inches(0.25),
             text, size=11, color=color, bold=True)


def add_pill(slide, x, y, text, color, w=None):
    if w is None:
        w = Inches(max(1.2, 0.08 * len(text) + 0.6))
    shp = add_rect(slide, x, y, w, Inches(0.32), PANEL_2, line=color, corner=0.5)
    add_text(slide, x, y + Inches(0.04), w, Inches(0.26), text, size=10, color=color, bold=True, align="center")
    return w


def new_slide(section, idx, total):
    s = prs.slides.add_slide(BLANK)
    slide_bg(s, BG)
    add_glow(s, Inches(0.5), Inches(0.5), 6, C_BLUE)
    add_glow(s, Inches(13), Inches(7), 6, C_CYAN)
    add_topbar(s, section, idx, total)
    add_footer(s, total, idx)
    return s


# ============ 各页 ============
TOTAL = 14
SECTIONS = ['封面', '痛点诊断', '产品定位', '能力总览', '排程引擎', '多目标优化',
            '业务模块', '技术架构', '决策可追溯', '质量与性能', '开源 vs 商业',
            '产品路线', '快速启动', '立即开始']


# ---- p1 封面 ----
def slide_cover():
    s = new_slide(SECTIONS[0], 1, TOTAL)
    add_pill(s, Inches(0.7), Inches(1.0), "● V0.1.0 · 首发", C_CYAN)
    add_pill(s, Inches(2.5), Inches(1.0), "Apache 2.0 开源", C_BLUE)
    add_pill(s, Inches(4.5), Inches(1.0), ".NET 10 · Vue 3", C_AMBER)

    add_text(s, Inches(0.7), Inches(1.7), Inches(8), Inches(1.5),
             "AIMes", size=88, color=TEXT, bold=True)
    add_text(s, Inches(0.7), Inches(2.95), Inches(8), Inches(0.6),
             "让 MES 从「记账」", size=32, color=TEXT2, bold=True)
    add_text(s, Inches(0.7), Inches(3.5), Inches(8), Inches(0.6),
             "升级为「会预测的助手」", size=32, color=C_BLUE, bold=True)

    add_text(s, Inches(0.7), Inches(4.4), Inches(8), Inches(1.0),
             "以 AI 排产排程为核心的开源 MES——规则引擎 + 多目标优化 + LLM 混合精调，\n每一次决策都可追溯，开箱即用。", size=14, color=TEXT2)

    metas = [("5min", "一键启动"), ("13+", "业务模块"), ("197", "测试覆盖")]
    for i, (v, k) in enumerate(metas):
        add_text(s, Inches(0.7 + i * 1.8), Inches(5.6), Inches(1.6), Inches(0.6),
                 v, size=30, color=C_CYAN, bold=True)
        add_text(s, Inches(0.7 + i * 1.8), Inches(6.15), Inches(1.6), Inches(0.3),
                 k, size=10, color=TEXT3)

    # 右侧轨道图（用嵌套圆 + 节点）
    cx, cy = Inches(10.2), Inches(4.0)
    for r_in in [2.6, 2.0, 1.4, 0.9]:
        r = Inches(r_in)
        ring = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - r, cy - r, r * 2, r * 2)
        ring.fill.background()
        ring.line.color.rgb = BORDER
        ring.line.width = Pt(0.5)
        ring.line.dash_style = 7

    core_r = Inches(0.9)
    core = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - core_r, cy - core_r, core_r * 2, core_r * 2)
    core.fill.solid()
    core.fill.fore_color.rgb = C_BLUE
    core.line.fill.background()
    add_text(s, cx - Inches(0.8), cy - Inches(0.18), Inches(1.6), Inches(0.4),
             "AIMes", size=18, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True, align="center")

    # 节点（围绕 1.4in 半径分布）
    import math
    nodes = [("排程\n引擎", C_CYAN, 90), ("质量\nSPC", C_AMBER, 30), ("设备\n健康", C_PINK, -30),
             ("风险\n预警", C_PURPLE, -90), ("RAG\n知识库", C_BLUE, -150), ("决策\n追溯", C_GREEN, 150)]
    rad = Inches(2.0)
    for label, c, ang in nodes:
        rx = cx + int(rad * math.cos(math.radians(ang))) - Inches(0.36)
        ry = cy - int(rad * math.sin(math.radians(ang))) - Inches(0.36)
        nb = add_rect(s, rx, ry, Inches(0.72), Inches(0.72), PANEL, line=c, corner=0.25)
        add_text(s, rx, ry + Inches(0.1), Inches(0.72), Inches(0.6),
                 label, size=9, color=c, bold=True, align="center")


# ---- p2 痛点 ----
def slide_pain():
    s = new_slide(SECTIONS[1], 2, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "PROBLEM · 工厂日常")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.9),
             "产线管理员每天都在「救火」，", size=36, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(12), Inches(0.9),
             "而传统 MES 只会「记账」。", size=36, color=C_AMBER, bold=True)
    add_text(s, Inches(0.55), Inches(2.85), Inches(11), Inches(0.5),
             "现有 MES 只记录「发生了什么」，从不告诉你「即将发生什么」。系统被忍受，而不被依赖。",
             size=14, color=TEXT2)

    cards = [
        ("⚠", "07:23", "早班开工", "设备故障未预警，工单延期，连锁反应已开始"),
        ("📋", "2.5h", "每日 Excel 排产", "手工排产靠经验，多目标无法兼顾，换型成本高"),
        ("🔌", "38%", "采集机不可用率", "边缘设备宕机频繁，数据采集断断续续"),
        ("🚨", "14+", "每日异常巡检", "人工巡检发现问题，等出问题再补救，永远滞后"),
    ]
    cw = Inches(2.85)
    for i, (ic, num, lbl, desc) in enumerate(cards):
        x = Inches(0.55 + i * 3.05)
        card = add_rect(s, x, Inches(3.7), cw, Inches(2.7), PANEL, line=BORDER, corner=0.06)
        # 图标小圆角
        ic_box = add_rect(s, x + Inches(0.25), Inches(3.95), Inches(0.5), Inches(0.5),
                          PANEL_2, line=C_PINK, corner=0.3)
        add_text(s, x + Inches(0.25), Inches(3.95), Inches(0.5), Inches(0.5),
                 ic, size=18, color=C_PINK, align="center", anchor="middle")
        add_text(s, x + Inches(0.25), Inches(4.55), cw, Inches(0.8),
                 num, size=36, color=C_PINK, bold=True)
        add_text(s, x + Inches(0.25), Inches(5.25), cw, Inches(0.3),
                 lbl, size=10, color=TEXT3, bold=True)
        add_text(s, x + Inches(0.25), Inches(5.65), Inches(2.55), Inches(1.0),
                 desc, size=11, color=TEXT2)

    # 用户原话条
    quote = add_rect(s, Inches(0.55), Inches(6.55), Inches(12.2), Inches(0.5),
                     PANEL, line=BORDER, corner=0.15)
    add_pill(s, Inches(0.7), Inches(6.62), "用户原话", C_PINK)
    add_text(s, Inches(2.0), Inches(6.62), Inches(8), Inches(0.36),
             "\"系统记了一堆，可它从没在出事之前提醒我一句。\"",
             size=12, color=TEXT, bold=True)
    add_text(s, Inches(10.2), Inches(6.62), Inches(2.6), Inches(0.36),
             "— 某汽配厂产线总管", size=10, color=TEXT3, align="right")


# ---- p3 三柱定位 ----
def slide_position():
    s = new_slide(SECTIONS[2], 3, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "PRODUCT · 三柱定位")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.9),
             "不只是 MES，更是产线管理员的 AI 副驾", size=34, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(2.05), Inches(11), Inches(0.5),
             "从被动记账到主动预测——三个维度，重新定义「智能」二字。",
             size=14, color=TEXT2)

    cols = [
        ("🧠", "AI 预测", C_BLUE, "不止排产排程，还要预测设备故障、物料齐套、产能瓶颈。",
         ["规则引擎 EDD / SPT / WSPT", "多目标 Pareto 优化", "LLM 混合精调", "风险预警 4 大类"]),
        ("🔍", "决策可追溯", C_CYAN, "每一次 AI 决策都有 prompt hash + context + 输入输出链路。",
         ["AiDecisionTrace 全链路", "Model / Prompt 哈希", "采纳反馈反哺", "审计日志 + JSON Diff"]),
        ("🚀", "开箱即用", C_AMBER, "Docker Compose 一键启动，5 分钟看到带演示数据的甘特图。",
         ["5 容器一键拉起", "13+ 业务看板内置降级", "JWT + 4 角色权限", "API 文档 / 健康检查"]),
    ]
    for i, (ic, title, color, desc, feats) in enumerate(cols):
        x = Inches(0.55 + i * 4.18)
        col = add_rect(s, x, Inches(2.85), Inches(3.95), Inches(3.7), PANEL, line=BORDER, corner=0.05)
        ic_box = add_rect(s, x + Inches(0.3), Inches(3.1), Inches(0.7), Inches(0.7),
                          PANEL_2, line=color, corner=0.25)
        add_text(s, x + Inches(0.3), Inches(3.1), Inches(0.7), Inches(0.7),
                 ic, size=24, color=color, align="center", anchor="middle")
        add_text(s, x + Inches(0.3), Inches(3.95), Inches(3.5), Inches(0.5),
                 title, size=22, color=TEXT, bold=True)
        add_text(s, x + Inches(0.3), Inches(4.5), Inches(3.5), Inches(0.7),
                 desc, size=12, color=TEXT2)
        for j, f in enumerate(feats):
            add_text(s, x + Inches(0.3), Inches(5.3 + j * 0.3), Inches(3.5), Inches(0.28),
                     f"▸  {f}", size=11, color=TEXT2)


# ---- p4 能力总览 + 雷达图 ----
def slide_overview():
    s = new_slide(SECTIONS[3], 4, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "CAPABILITY · 能力总览")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.9),
             "六维能力雷达 · 开源版同样硬核", size=34, color=TEXT, bold=True)

    # 左侧雷达图
    chart_data = CategoryChartData()
    chart_data.categories = ['AI 排程', '实时预警', '决策可解释', '部署体验', '扩展性', '测试覆盖']
    chart_data.add_series('AIMes V1', (9.2, 8.8, 9.5, 9.0, 8.5, 9.3))
    chart_data.add_series('传统 MES', (3.5, 4.2, 3.0, 5.5, 4.5, 4.0))

    chart_box = add_rect(s, Inches(0.55), Inches(2.3), Inches(6.8), Inches(4.5),
                        PANEL, line=BORDER, corner=0.04)
    chart = s.shapes.add_chart(XL_CHART_TYPE.RADAR, Inches(0.7), Inches(2.5),
                                Inches(6.5), Inches(4.2), chart_data).chart
    chart.has_title = False
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(11)
    chart.legend.font.color.rgb = TEXT2
    # 系列颜色
    s1 = chart.series[0]
    s1.format.line.color.rgb = C_CYAN
    s1.format.line.width = Pt(2.5)
    s2 = chart.series[1]
    s2.format.line.color.rgb = C_PINK
    s2.format.line.width = Pt(1.8)

    # 右侧 5 KPI
    kpis = [
        ("★", C_BLUE, "AI 排程引擎", "规则 + 优化 + LLM 三段式", "9.2"),
        ("◆", C_CYAN, "决策可追溯", "每个决策可回溯至 prompt", "9.5"),
        ("▲", C_AMBER, "实时预警", "SignalR 6 类通知 + Toast", "8.8"),
        ("●", C_PINK, "开箱体验", "5 min 一键启动 + 演示数据", "9.0"),
        ("✓", C_GREEN, "测试与质量", "197 测试 · CI 阻断", "9.3"),
    ]
    for i, (ic, c, t, d, v) in enumerate(kpis):
        y = Inches(2.3 + i * 0.92)
        add_rect(s, Inches(7.7), y, Inches(5.1), Inches(0.82), PANEL, line=BORDER, corner=0.08)
        add_rect(s, Inches(7.85), y + Inches(0.16), Inches(0.5), Inches(0.5),
                 PANEL_2, line=c, corner=0.25)
        add_text(s, Inches(7.85), y + Inches(0.18), Inches(0.5), Inches(0.5),
                 ic, size=14, color=c, bold=True, align="center", anchor="middle")
        add_text(s, Inches(8.55), y + Inches(0.1), Inches(3.4), Inches(0.32),
                 t, size=13, color=TEXT, bold=True)
        add_text(s, Inches(8.55), y + Inches(0.45), Inches(3.4), Inches(0.3),
                 d, size=10, color=TEXT3)
        add_text(s, Inches(11.95), y + Inches(0.18), Inches(0.85), Inches(0.5),
                 v, size=20, color=c, bold=True, align="right", anchor="middle")


# ---- p5 排程引擎流水线 + 柱状对比 ----
def slide_scheduler():
    s = new_slide(SECTIONS[4], 5, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "SCHEDULING · 核心引擎")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "三段式架构 · 规则保底，AI 增益", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "确定性规则引擎产出可行解，LLM 在其上做局部精调，硬约束验证强制兜底——快、稳、可解释。",
             size=12, color=TEXT2)

    steps = [
        ("STEP 01", "规则引擎", "EDD/SPT/WSPT + 最小负载\n+ 瓶颈优先 + 换线感知"),
        ("STEP 02", "约束验证", "容量 / 物料 / 工艺\n锁定周期 / 设备能力多重校验"),
        ("STEP 03", "LLM 精调", "设备选择与顺序的局部优化\n输出受约束再验证"),
        ("STEP 04", "失败回退", "违反硬约束自动降级到规则引擎方案\n所有决策写 Trace"),
    ]
    sw = Inches(2.95)
    for i, (n, t, d) in enumerate(steps):
        x = Inches(0.55 + i * 3.1)
        add_rect(s, x, Inches(2.55), sw, Inches(1.55), PANEL, line=BORDER, corner=0.08)
        add_text(s, x + Inches(0.2), Inches(2.7), sw, Inches(0.3),
                 n, size=10, color=C_CYAN, bold=True, font="JetBrains Mono")
        add_text(s, x + Inches(0.2), Inches(3.05), sw, Inches(0.4),
                 t, size=15, color=TEXT, bold=True)
        add_text(s, x + Inches(0.2), Inches(3.45), Inches(2.7), Inches(0.7),
                 d, size=10, color=TEXT2)
        # 箭头
        if i < 3:
            ax = x + sw + Inches(0.02)
            arr = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, ax, Inches(3.2), Inches(0.18), Inches(0.24))
            arr.fill.solid()
            arr.fill.fore_color.rgb = C_CYAN
            arr.line.fill.background()

    # 下方左：甘特图（用堆叠条形示意，纯形状绘制）
    add_rect(s, Inches(0.55), Inches(4.3), Inches(7.0), Inches(2.7), PANEL, line=BORDER, corner=0.05)
    add_text(s, Inches(0.75), Inches(4.45), Inches(6), Inches(0.3),
             "设备分组排程甘特", size=11, color=C_CYAN, bold=True)
    add_text(s, Inches(0.75), Inches(4.75), Inches(6), Inches(0.3),
             "瓶颈高亮 · 冲突闪烁 · 拖拽调整", size=9, color=TEXT3)

    equips = ['EQ-A1', 'EQ-A2', 'EQ-B1', 'EQ-B2', 'EQ-C1']
    rows = [
        [(0, 4, C_BLUE), (4, 7, C_CYAN), (7, 11, C_PURPLE), (11, 14, C_AMBER)],
        [(1, 5, C_CYAN), (5, 9, C_BLUE), (9, 14, C_PURPLE)],
        [(0, 3, C_PURPLE), (3, 6, C_AMBER), (6, 11, C_BLUE), (11, 14, C_CYAN)],
        [(2, 5, C_PINK), (5, 9, C_BLUE), (9, 13, C_CYAN)],
        [(1, 4, C_BLUE), (4, 8, C_PURPLE), (8, 12, C_AMBER)],
    ]
    gx0 = Inches(1.5)
    gw_per = (Inches(5.7)) / 14
    gy0 = Inches(5.15)
    gh = Inches(0.28)
    for ri, row in enumerate(rows):
        y = gy0 + Inches(0.32) * ri
        add_text(s, Inches(0.75), y, Inches(0.7), Inches(0.28),
                 equips[ri], size=9, color=TEXT2, anchor="middle")
        for st, ed, c in row:
            bx = gx0 + gw_per * st
            bw = gw_per * (ed - st) - Inches(0.02)
            bar = add_rect(s, bx, y, bw, gh, c, corner=0.2)
            set_fill_alpha(bar, 88)
    # 瓶颈虚线（8h）
    bln_x = gx0 + gw_per * 8
    bottleneck = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, bln_x, gy0 - Inches(0.05),
                                     Inches(0.015), Inches(1.85))
    bottleneck.fill.solid()
    bottleneck.fill.fore_color.rgb = C_AMBER
    bottleneck.line.fill.background()
    add_text(s, bln_x + Inches(0.05), gy0 - Inches(0.18), Inches(1.5), Inches(0.2),
             "瓶颈 8h", size=8, color=C_AMBER, bold=True)

    # 下方右：柱状对比
    add_rect(s, Inches(7.7), Inches(4.3), Inches(5.1), Inches(2.7), PANEL, line=BORDER, corner=0.05)
    add_text(s, Inches(7.9), Inches(4.45), Inches(4.8), Inches(0.3),
             "规则引擎 vs 人工排产 · 对比", size=11, color=C_BLUE, bold=True)
    cd = CategoryChartData()
    cd.categories = ['交期达成', '利用率', '换型(↓)', '耗时(↓)', '可解释']
    cd.add_series('规则引擎', (97, 88, 82, 95, 98))
    cd.add_series('人工排产', (78, 62, 48, 30, 40))
    chart = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(7.85), Inches(4.75),
                                Inches(4.85), Inches(2.2), cd).chart
    chart.has_title = False
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(9)
    chart.legend.font.color.rgb = TEXT2
    chart.series[0].format.fill.solid()
    chart.series[0].format.fill.fore_color.rgb = C_CYAN
    chart.series[1].format.fill.solid()
    chart.series[1].format.fill.fore_color.rgb = C_PINK


# ---- p6 多目标 ----
def slide_objectives():
    s = new_slide(SECTIONS[5], 6, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "OPTIMIZATION · 多目标")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "四个目标函数 · 一个均衡模式", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "交期、利用率、换型、平衡四目标，可独立运行，可字典序组合，工厂可按场景切换。",
             size=12, color=TEXT2)

    objs = [
        ("DueDate", C_PINK, "交期优先", "最小化逾期时间加权和，适合订单交付压力大场景", "min Σ max(0, End−Due)·W"),
        ("Utilization", C_CYAN, "利用率优先", "最大化瓶颈设备繁忙占比，适合产能受限场景", "max Σ Busy/Total"),
        ("Changeover", C_AMBER, "换型成本最小", "最小化产品换型时间总和，适合多品种小批量", "min Σ Changeover(p→q)"),
        ("Balanced", C_PURPLE, "均衡模式 · 默认", "字典序：先满足交期 ≥ 95%，再优化利用率，再压缩换型", "Lex: Due → Util → Co"),
    ]
    for i, (name, c, t, d, f) in enumerate(objs):
        y = Inches(2.7 + i * 1.05)
        add_rect(s, Inches(0.55), y, Inches(7.2), Inches(0.95), PANEL, line=BORDER, corner=0.06)
        add_rect(s, Inches(0.7), y + Inches(0.22), Inches(1.4), Inches(0.5), PANEL_2, line=c, corner=0.18)
        add_text(s, Inches(0.7), y + Inches(0.22), Inches(1.4), Inches(0.5),
                 name, size=11, color=c, bold=True, font="JetBrains Mono", align="center", anchor="middle")
        add_text(s, Inches(2.25), y + Inches(0.12), Inches(3.5), Inches(0.4),
                 t, size=14, color=TEXT, bold=True)
        add_text(s, Inches(2.25), y + Inches(0.5), Inches(3.6), Inches(0.4),
                 d, size=10, color=TEXT2)
        add_rect(s, Inches(5.95), y + Inches(0.32), Inches(1.7), Inches(0.32),
                 BG2, line=BORDER, corner=0.2)
        add_text(s, Inches(5.95), y + Inches(0.32), Inches(1.7), Inches(0.32),
                 f, size=8, color=TEXT3, font="JetBrains Mono", align="center", anchor="middle")

    # 右侧雷达图
    add_rect(s, Inches(7.95), Inches(2.7), Inches(4.85), Inches(4.2), PANEL, line=BORDER, corner=0.05)
    add_text(s, Inches(8.1), Inches(2.85), Inches(4.5), Inches(0.3),
             "四目标权衡 · 雷达", size=11, color=C_AMBER, bold=True)
    cd = CategoryChartData()
    cd.categories = ['交期达成', '利用率', '换型节省', '稳定性', '求解速度']
    cd.add_series('DueDate', (98, 72, 55, 80, 96))
    cd.add_series('Utilization', (78, 96, 65, 82, 90))
    cd.add_series('Changeover', (72, 80, 98, 78, 88))
    cd.add_series('Balanced', (95, 90, 85, 95, 85))
    chart = s.shapes.add_chart(XL_CHART_TYPE.RADAR, Inches(8.0), Inches(3.1),
                                Inches(4.75), Inches(3.7), cd).chart
    chart.has_title = False
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(9)
    chart.legend.font.color.rgb = TEXT2
    for ser, c in zip(chart.series, [C_PINK, C_CYAN, C_AMBER, C_PURPLE]):
        ser.format.line.color.rgb = c
        ser.format.line.width = Pt(2.0)


# ---- p7 业务模块 Bento ----
def slide_modules():
    s = new_slide(SECTIONS[6], 7, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "MODULES · 业务版图")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "13+ 业务模块 · 全模块演示降级", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "从排程到知识库，所有看板内置「后端不可用 → 演示数据」分支，零数据也能跑出全貌。",
             size=12, color=TEXT2)

    # 6 列 3 行 bento (使用合并大块的方式，简化为3×3)
    items = [
        ("⚡", "AI 排程引擎", C_BLUE, "3 段式 · 规则 + 约束验证 + LLM 精调，4 个目标函数任选", True),
        ("📊", "质量 SPC", C_CYAN, "SPC 图 + 运行规则告警 + 质检记录与不良品分级", False),
        ("🛠", "设备管理", C_AMBER, "状态跟踪 + 维护记录 + 设备健康分", False),
        ("🚨", "风险预警", C_PINK, "工单延期 / 设备故障 / 物料齐套 / 产能瓶颈", False),
        ("📦", "BOM / 工艺", C_PURPLE, "多级 BOM + 工艺路线 + 变更管理", False),
        ("📚", "知识库 RAG", C_GREEN, "文档上传 + 关键字检索 + 演示 RAG 问答", False),
        ("📋", "异常 / 库存 / 采购", C_BLUE, "上报分级响应 · 库存出入库 · 采购订单", False),
        ("🧾", "审计日志", C_CYAN, "操作追踪 + JSON Diff + IP / UA 记录", False),
        ("🏷", "条码打印", C_AMBER, "QR 码批量打印 + 筛选搜索", False),
    ]
    cw = Inches(4.05)
    ch = Inches(1.42)
    for i, (ic, t, c, d, big) in enumerate(items):
        col = i % 3
        row = i // 3
        x = Inches(0.55 + col * 4.18)
        y = Inches(2.6 + row * 1.5)
        add_rect(s, x, y, cw, ch, PANEL, line=BORDER, corner=0.06)
        add_rect(s, x + Inches(0.2), y + Inches(0.2), Inches(0.45), Inches(0.45),
                 PANEL_2, line=c, corner=0.2)
        add_text(s, x + Inches(0.2), y + Inches(0.22), Inches(0.45), Inches(0.4),
                 ic, size=14, color=c, align="center", anchor="middle")
        add_text(s, x + Inches(0.78), y + Inches(0.2), Inches(3), Inches(0.4),
                 t, size=14, color=TEXT, bold=True)
        add_text(s, x + Inches(0.2), y + Inches(0.82), cw - Inches(0.4), Inches(0.55),
                 d, size=10, color=TEXT3)


# ---- p8 架构 ----
def slide_arch():
    s = new_slide(SECTIONS[7], 8, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "ARCHITECTURE · 技术架构")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "现代化技术栈 · .NET 10 + Vue 3", size=32, color=TEXT, bold=True)

    # 左侧 4 层架构
    layers = [
        ("PRESENTATION", C_BLUE, ["Vue 3 SPA", "dhtmlx-gantt", "SignalR Toast", "Vite + TS"]),
        ("API LAYER", C_CYAN, ["ASP.NET Core 极简 API", "JWT + 4 角色", "Rate Limit", "Swagger"]),
        ("DOMAIN · MES.AI", C_PURPLE, ["SchedulingAgent", "QualityAgent", "KnowledgeAgent", "DecisionTrace"]),
        ("INFRASTRUCTURE", C_AMBER, ["PostgreSQL 16", "Redis 7", "RabbitMQ", "Qdrant 1.13", "Serilog+OTLP"]),
    ]
    arch_x = Inches(0.55)
    arch_w = Inches(8.3)
    arch_y = Inches(2.1)
    layer_h = Inches(1.15)
    for i, (label, c, items) in enumerate(layers):
        y = arch_y + layer_h * i + Inches(0.1) * i
        outer = add_rect(s, arch_x, y, arch_w, layer_h, PANEL, line=c, corner=0.05)
        add_text(s, arch_x + Inches(0.15), y + Inches(0.08), Inches(3), Inches(0.25),
                 label, size=9, color=TEXT3, bold=True, font="JetBrains Mono")
        # 各 box
        nb = len(items)
        bw = (arch_w - Inches(0.3) - Inches(0.1) * (nb - 1)) / nb
        for j, it in enumerate(items):
            bx = arch_x + Inches(0.15) + (bw + Inches(0.1)) * j
            by = y + Inches(0.42)
            box = add_rect(s, bx, by, bw, Inches(0.6), PANEL_2, line=c, corner=0.15)
            add_text(s, bx, by, bw, Inches(0.6),
                     it, size=11, color=TEXT, bold=True, align="center", anchor="middle")

    # 层间箭头
    for i in range(3):
        ay = arch_y + layer_h * (i + 1) + Inches(0.1) * i + Inches(-0.02)
        arr = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, arch_x + arch_w / 2 - Inches(0.08),
                                  ay, Inches(0.16), Inches(0.14))
        arr.fill.solid()
        arr.fill.fore_color.rgb = C_CYAN
        arr.line.fill.background()

    # 右侧 4 个分组
    sides = [
        ("观测 & 测试", "Serilog · OTLP\nxUnit + FluentAssertions\nPlaywright E2E · BenchmarkDotNet"),
        ("AI 框架", "Microsoft.SemanticKernel\nMicrosoft.ML.OnnxRuntime\nLLM Provider 适配 (Ollama)"),
        ("硬性规则", "可空引用类型 · 警告即错误\n极简 API + TypedResults\n构造函数注入 · 无静态状态"),
        ("CI / 部署", "GitHub Actions · 5 容器一键拉起\ndotnet format 阻断\n分析器开启"),
    ]
    side_x = Inches(9.05)
    side_w = Inches(3.75)
    for i, (t, l) in enumerate(sides):
        y = arch_y + (Inches(1.15) + Inches(0.05)) * i
        add_rect(s, side_x, y, side_w, Inches(1.15), PANEL, line=BORDER, corner=0.05)
        add_text(s, side_x + Inches(0.2), y + Inches(0.12), side_w, Inches(0.3),
                 t, size=10, color=C_CYAN, bold=True)
        add_text(s, side_x + Inches(0.2), y + Inches(0.4), side_w - Inches(0.4), Inches(0.7),
                 l, size=9, color=TEXT2)


# ---- p9 决策可追溯 ----
def slide_trace():
    s = new_slide(SECTIONS[8], 9, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "EXPLAINABILITY · 决策可追溯")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "每个 AI 决策 · 都有完整指纹", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "从模型版本到上下文哈希，从输入摘要到业务键，AiDecisionTrace 一行不漏，事后随时回溯。",
             size=12, color=TEXT2)

    # 左侧 Trace 字段卡
    add_rect(s, Inches(0.55), Inches(2.6), Inches(6.4), Inches(4.4), PANEL, line=BORDER, corner=0.05)
    add_pill(s, Inches(0.75), Inches(2.78), "Trace 示例", C_CYAN)
    add_text(s, Inches(3.5), Inches(2.85), Inches(3.3), Inches(0.3),
             "trace_id · 0x7f3a2c91", size=9, color=TEXT3, font="JetBrains Mono", align="right")

    fields = [
        ("Model", "deterministic-v1", TEXT),
        ("PromptHash", "sha256:9c2f...e81b", C_AMBER),
        ("ContextHash", "sha256:4a17...d3f0", TEXT),
        ("InputSummary", "orders=42 · equipment=8 · obj=balanced", TEXT),
        ("OutputSummary", "due_rate=97% · util=84% · co=12", TEXT),
        ("BizKey", "workshop=W01 · plan=2026-05-18", TEXT),
        ("Adopted", "YES · by lead_001", C_GREEN),
    ]
    for i, (k, v, c) in enumerate(fields):
        y = Inches(3.3 + i * 0.5)
        add_text(s, Inches(0.75), y, Inches(1.3), Inches(0.4),
                 k, size=10, color=C_CYAN, font="JetBrains Mono", align="right", anchor="middle")
        add_rect(s, Inches(2.15), y, Inches(4.7), Inches(0.4), BG2, line=BORDER, corner=0.15)
        add_text(s, Inches(2.25), y, Inches(4.5), Inches(0.4),
                 v, size=10, color=c, font="JetBrains Mono", anchor="middle")

    # 右侧采纳堆叠柱
    add_rect(s, Inches(7.15), Inches(2.6), Inches(5.65), Inches(4.4), PANEL, line=BORDER, corner=0.05)
    add_pill(s, Inches(7.35), Inches(2.78), "采纳反馈分布 · 7 天", C_BLUE)
    add_text(s, Inches(7.35), Inches(3.18), Inches(5.2), Inches(0.3),
             "采纳率反哺规则权重", size=9, color=TEXT3)
    cd = CategoryChartData()
    cd.categories = ['05/12', '05/13', '05/14', '05/15', '05/16', '05/17', '05/18']
    cd.add_series('采纳', (14, 16, 18, 15, 20, 22, 24))
    cd.add_series('调整后采纳', (5, 4, 3, 6, 4, 3, 2))
    cd.add_series('拒绝', (3, 2, 2, 1, 1, 1, 1))
    chart = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_STACKED, Inches(7.3), Inches(3.45),
                                Inches(5.4), Inches(3.4), cd).chart
    chart.has_title = False
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(9)
    chart.legend.font.color.rgb = TEXT2
    for ser, c in zip(chart.series, [C_CYAN, C_BLUE, C_PINK]):
        ser.format.fill.solid()
        ser.format.fill.fore_color.rgb = c


# ---- p10 质量 & 性能 ----
def slide_quality():
    s = new_slide(SECTIONS[9], 10, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "QUALITY · 工程质量")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "197 测试 · 性能基准 · 安全基线", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "从单元到 E2E，从压测到安全，每一层都有红线兜底。",
             size=12, color=TEXT2)

    # 左侧饼图
    add_rect(s, Inches(0.55), Inches(2.55), Inches(6.0), Inches(3.0), PANEL, line=BORDER, corner=0.05)
    add_pill(s, Inches(0.75), Inches(2.7), "测试覆盖分布", C_CYAN)
    add_text(s, Inches(0.75), Inches(3.07), Inches(5.5), Inches(0.3),
             "合计 197 用例", size=9, color=TEXT3)
    cd = CategoryChartData()
    cd.categories = ['单元测试', '集成测试', 'E2E (Playwright)', 'BenchmarkDotNet']
    cd.add_series('Tests', (152, 45, 12, 8))
    chart = s.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT, Inches(0.7), Inches(3.3),
                                Inches(5.7), Inches(2.2), cd).chart
    chart.has_title = False
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.RIGHT
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(10)
    chart.legend.font.color.rgb = TEXT2
    pts = chart.plots[0].series[0].points
    for pt, c in zip(pts, [C_BLUE, C_CYAN, C_AMBER, C_PURPLE]):
        pt.format.fill.solid()
        pt.format.fill.fore_color.rgb = c

    # 右侧折线
    add_rect(s, Inches(6.75), Inches(2.55), Inches(6.05), Inches(3.0), PANEL, line=BORDER, corner=0.05)
    add_pill(s, Inches(6.95), Inches(2.7), "排程性能 · 订单数 vs 耗时", C_AMBER)
    add_text(s, Inches(6.95), Inches(3.07), Inches(5.5), Inches(0.3),
             "BenchmarkDotNet · ms", size=9, color=TEXT3)
    cd2 = CategoryChartData()
    cd2.categories = ['10', '30', '50', '100', '200', '500', '1000']
    cd2.add_series('规则引擎', (8, 18, 28, 55, 118, 310, 680))
    cd2.add_series('规则+LLM', (120, 160, 210, 290, 460, 820, 1500))
    chart2 = s.shapes.add_chart(XL_CHART_TYPE.LINE, Inches(6.9), Inches(3.3),
                                 Inches(5.8), Inches(2.2), cd2).chart
    chart2.has_title = False
    chart2.has_legend = True
    chart2.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart2.legend.include_in_layout = False
    chart2.legend.font.size = Pt(9)
    chart2.legend.font.color.rgb = TEXT2
    for ser, c in zip(chart2.series, [C_CYAN, C_PURPLE]):
        ser.format.line.color.rgb = c
        ser.format.line.width = Pt(2.5)

    # 底部 4 KPI
    stats = [("152", "单元测试", "域逻辑 + 规则引擎 + 重排器", C_BLUE),
             ("45", "集成测试", "WebApplicationFactory + DB", C_CYAN),
             ("E2E", "Playwright", "登录/排程/看板黄金路径", C_AMBER),
             ("JWT", "安全基线", "Refresh 轮转 + 速率限制", C_PINK)]
    for i, (v, l, d, c) in enumerate(stats):
        x = Inches(0.55 + i * 3.07)
        y = Inches(5.7)
        add_rect(s, x, y, Inches(2.95), Inches(1.25), PANEL, line=BORDER, corner=0.06)
        add_text(s, x + Inches(0.2), y + Inches(0.12), Inches(2.7), Inches(0.55),
                 v, size=28, color=c, bold=True)
        add_text(s, x + Inches(0.2), y + Inches(0.7), Inches(2.7), Inches(0.25),
                 l, size=10, color=TEXT3, bold=True)
        add_text(s, x + Inches(0.2), y + Inches(0.95), Inches(2.7), Inches(0.3),
                 d, size=9, color=TEXT2)


# ---- p11 OSS vs Commercial ----
def slide_vs():
    s = new_slide(SECTIONS[10], 11, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "EDITIONS · 开源 & 商业")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "开源版给你 80% · 商业版给你最后一公里", size=30, color=TEXT, bold=True)

    cols = [
        ("开源版", C_CYAN, "你正在看", "Apache 2.0 · 单机 Docker · GitHub Issues",
         [("规则引擎 (EDD/SPT/WSPT)", "deterministic-v1", "y"),
          ("重排器 (插单/故障/锁定)", "Rescheduler", "y"),
          ("多目标 4 函数 (单目标)", "Due/Util/Co/Bal", "y"),
          ("LLM 混合精调", "接口占位", "p"),
          ("ONNX 视觉质检", "接口占位 + LLM 兜底", "p"),
          ("关键字检索 / 演示 RAG", "demo", "y"),
          ("Pareto Top-3 / 自学习", "商业版", "n"),
          ("K8s / 多租户 / SLA", "商业版", "n")]),
        ("商业版", C_AMBER, "联系我们", "商业许可 · K8s/多租户 · 1 工作日响应",
         [("规则引擎 (全部继承)", "同开源 +", "y"),
          ("LLM 多目标 Pareto Top-3", "完整精调", "y"),
          ("历史数据自学习", "采纳反馈反哺", "y"),
          ("多车间协同排程", "Cross-Workshop", "y"),
          ("ONNX 真实模型 + AB 实验", "多模型版本管理", "y"),
          ("Qdrant 工业级 RAG", "完整 Agent 编排", "y"),
          ("边缘协议 / BI 数据管道", "Modbus / OPC UA", "y"),
          ("K8s/多租户/私有部署 + SLA", "企业支持", "y")])
    ]
    for i, (nm, c, pill, sub, feats) in enumerate(cols):
        x = Inches(0.55 + i * 6.18)
        cw = Inches(6.0)
        add_rect(s, x, Inches(2.05), cw, Inches(4.95), PANEL, line=c, corner=0.05)
        add_text(s, x + Inches(0.3), Inches(2.2), cw, Inches(0.5),
                 nm, size=22, color=c, bold=True)
        add_text(s, x + Inches(0.3), Inches(2.7), cw, Inches(0.3),
                 sub, size=9, color=TEXT3)
        # 右上角 pill
        add_pill(s, x + cw - Inches(1.5), Inches(2.2), pill, c, w=Inches(1.3))
        # feats
        for j, (lab, val, st) in enumerate(feats):
            y = Inches(3.15 + j * 0.45)
            add_rect(s, x + Inches(0.3), y, cw - Inches(0.6), Inches(0.4),
                     PANEL_2, corner=0.18)
            # check icon
            color_map = {"y": C_CYAN, "p": C_AMBER, "n": RGBColor(0x47, 0x55, 0x69)}
            sym_map = {"y": "✓", "p": "○", "n": "−"}
            ck = add_rect(s, x + Inches(0.45), y + Inches(0.08), Inches(0.24), Inches(0.24),
                          color_map[st], corner=0.5)
            add_text(s, x + Inches(0.45), y + Inches(0.08), Inches(0.24), Inches(0.24),
                     sym_map[st], size=10, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True,
                     align="center", anchor="middle")
            add_text(s, x + Inches(0.85), y + Inches(0.05), Inches(3.0), Inches(0.3),
                     lab, size=11, color=TEXT, anchor="middle")
            add_text(s, x + Inches(3.85), y + Inches(0.05), Inches(1.8), Inches(0.3),
                     val, size=9, color=TEXT3, font="JetBrains Mono", align="right", anchor="middle")


# ---- p12 路线 ----
def slide_roadmap():
    s = new_slide(SECTIONS[11], 12, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "ROADMAP · 演进路线")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "从规则到自学习 · V1 → V4 长期愿景", size=30, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "Phase 1 已落地，Phase 2 切片正在路上。开源版功能边界冻结，未来版本只增不减。",
             size=12, color=TEXT2)

    # 时间线
    line_y = Inches(4.5)
    line = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), line_y, Inches(11.3), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = C_BLUE
    line.line.fill.background()

    nodes = [
        ("v0.1.0 — DONE", "P1 · 开源首发", "规则引擎 + 13+ 模块\n决策追溯 + Docker Compose 一键启动",
         "2026.05.14", C_CYAN, "done", True),
        ("v0.2.x — NOW", "P2 · DX 与稳定性", "启动横幅 + 路径自动跳转\nProduction Swagger · 文档与故障排查",
         "2026.05 · 进行中", C_AMBER, "now", False),
        ("v0.3 — NEXT", "P3 · LLM 精调下沉", "混合架构能力增强\n边缘协议适配实验 + 知识库向量基础",
         "2026 H2", C_PURPLE, "future", True),
        ("v4.0 — VISION", "P4 · 插件化平台", "插件架构 · 多车间协同\n自学习反哺 · 工业 Agent 生态",
         "2027+", C_PURPLE, "future", False),
    ]
    for i, (ver, title, desc, dt, c, st, top) in enumerate(nodes):
        cx = Inches(1.5 + i * 3.05)
        # 节点圆
        dot = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - Inches(0.18), line_y - Inches(0.16),
                                  Inches(0.36), Inches(0.36))
        dot.fill.solid()
        dot.fill.fore_color.rgb = c
        dot.line.color.rgb = RGBColor(0xFF, 0xFF, 0xFF) if st == "now" else c
        dot.line.width = Pt(1)
        # 卡片
        card_w = Inches(2.6)
        if top:
            cy = Inches(2.55)
        else:
            cy = Inches(4.95)
        add_rect(s, cx - card_w / 2, cy, card_w, Inches(1.7), PANEL, line=c, corner=0.06)
        add_text(s, cx - card_w / 2 + Inches(0.2), cy + Inches(0.15), card_w, Inches(0.3),
                 ver, size=10, color=c, bold=True, font="JetBrains Mono")
        add_text(s, cx - card_w / 2 + Inches(0.2), cy + Inches(0.45), card_w, Inches(0.4),
                 title, size=14, color=TEXT, bold=True)
        add_text(s, cx - card_w / 2 + Inches(0.2), cy + Inches(0.85), card_w - Inches(0.4),
                 Inches(0.6), desc, size=9, color=TEXT2)
        add_text(s, cx - card_w / 2 + Inches(0.2), cy + Inches(1.35), card_w - Inches(0.4),
                 Inches(0.3), dt, size=9, color=C_CYAN, font="JetBrains Mono")


# ---- p13 Quickstart ----
def slide_quickstart():
    s = new_slide(SECTIONS[12], 13, TOTAL)
    eyebrow(s, Inches(0.55), Inches(0.85), "QUICKSTART · 5 分钟启动")
    add_text(s, Inches(0.55), Inches(1.25), Inches(12), Inches(0.7),
             "三步上车 · 看到带数据的甘特", size=32, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(1.95), Inches(11.5), Inches(0.4),
             "需要：Docker Desktop ≥ 4.20 · 8GB RAM · 20GB 磁盘空间。",
             size=12, color=TEXT2)

    # 左侧步骤
    steps = [
        ("1", "克隆并启动", "一条命令拉起 5 个容器（API · Postgres · Redis · RabbitMQ · Qdrant）。\n首次拉镜像约 3-5 分钟。"),
        ("2", "等待 healthy", "看到所有容器 healthy 后，浏览器打开 http://localhost:5000，自动跳转到登录页。"),
        ("3", "登录 · 看到甘特", "用 admin / admin@123 登录，立即看到带演示数据的排程甘特图。"),
    ]
    for i, (n, t, d) in enumerate(steps):
        y = Inches(2.6 + i * 1.35)
        add_rect(s, Inches(0.55), y, Inches(6.0), Inches(1.2), PANEL, line=BORDER, corner=0.05)
        add_rect(s, Inches(0.7), y + Inches(0.25), Inches(0.7), Inches(0.7), C_BLUE, corner=0.2)
        add_text(s, Inches(0.7), y + Inches(0.25), Inches(0.7), Inches(0.7),
                 n, size=24, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True, align="center", anchor="middle")
        add_text(s, Inches(1.55), y + Inches(0.2), Inches(4.8), Inches(0.4),
                 t, size=14, color=TEXT, bold=True)
        add_text(s, Inches(1.55), y + Inches(0.6), Inches(4.8), Inches(0.6),
                 d, size=10, color=TEXT2)

    # 右侧终端
    add_rect(s, Inches(6.75), Inches(2.6), Inches(6.05), Inches(4.0),
             RGBColor(0x00, 0x08, 0x14), line=BORDER, corner=0.04)
    # 终端标题栏
    add_rect(s, Inches(6.75), Inches(2.6), Inches(6.05), Inches(0.36),
             PANEL_2, corner=0.04)
    for j, c in enumerate([RGBColor(0xFF, 0x5F, 0x56), RGBColor(0xFF, 0xBD, 0x2E), RGBColor(0x27, 0xC9, 0x3F)]):
        d = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.9 + j * 0.22), Inches(2.7),
                                Inches(0.14), Inches(0.14))
        d.fill.solid()
        d.fill.fore_color.rgb = c
        d.line.fill.background()
    add_text(s, Inches(7.7), Inches(2.65), Inches(4), Inches(0.3),
             "~/aimes — bash", size=9, color=TEXT3, font="JetBrains Mono")

    lines = [
        ("$ ", "git clone https://github.com/YOUR_ORG/aimes.git", C_GREEN, TEXT),
        ("$ ", "cd aimes/v1", C_GREEN, TEXT),
        ("$ ", "docker compose up -d", C_GREEN, TEXT),
        ("", "", TEXT2, TEXT2),
        ("", "[+] Running 5/5", TEXT2, TEXT2),
        ("", "  ✔ aimes-postgres   Healthy", TEXT2, C_CYAN),
        ("", "  ✔ aimes-redis      Healthy", TEXT2, C_CYAN),
        ("", "  ✔ aimes-rabbitmq   Healthy", TEXT2, C_CYAN),
        ("", "  ✔ aimes-qdrant     Healthy", TEXT2, C_CYAN),
        ("", "  ✔ aimes-api        Healthy", TEXT2, C_CYAN),
        ("", "", TEXT2, TEXT2),
        ("", " Login   → http://localhost:5000", TEXT2, C_CYAN),
        ("", " Swagger → http://localhost:5000/swagger", TEXT2, C_CYAN),
        ("", " 默认账号 admin / admin@123", TEXT2, TEXT2),
    ]
    for i, (pr, txt, pc, tc) in enumerate(lines):
        y = Inches(3.05 + i * 0.23)
        if pr:
            add_text(s, Inches(6.95), y, Inches(0.3), Inches(0.22),
                     pr, size=10, color=pc, font="JetBrains Mono")
        add_text(s, Inches(7.15), y, Inches(5.5), Inches(0.22),
                 txt, size=10, color=tc, font="JetBrains Mono")


# ---- p14 CTA ----
def slide_cta():
    s = new_slide(SECTIONS[13], 14, TOTAL)
    add_glow(s, Inches(11), Inches(4), 8, C_BLUE)

    eyebrow(s, Inches(0.55), Inches(1.4), "START · 立即开始")
    add_text(s, Inches(0.55), Inches(1.85), Inches(8), Inches(1.1),
             "让 MES 从此", size=48, color=TEXT, bold=True)
    add_text(s, Inches(0.55), Inches(2.85), Inches(8), Inches(1.1),
             "「会预测」", size=58, color=C_CYAN, bold=True)
    add_text(s, Inches(0.55), Inches(4.0), Inches(7.5), Inches(0.9),
             "开源版给工厂一个能用、能信、能扩的起点。\n商业版给你最后一公里——LLM 多目标、自学习、多租户、SLA。",
             size=14, color=TEXT2)

    # 三个 CTA 按钮
    btns = [
        ("⚡", "开源仓库", "github.com/YOUR_ORG/aimes", C_BLUE, True),
        ("✉", "商业版咨询", "zenweb@163.com", C_CYAN, False),
        ("📖", "完整文档 / Quickstart", "_docs/quickstart.md", C_AMBER, False),
    ]
    for i, (ic, t, v, c, primary) in enumerate(btns):
        y = Inches(5.05 + i * 0.7)
        if primary:
            add_rect(s, Inches(0.55), y, Inches(7.5), Inches(0.6), c, corner=0.15)
            tcol = RGBColor(0xFF, 0xFF, 0xFF)
            sub = RGBColor(0xE0, 0xEF, 0xFF)
        else:
            add_rect(s, Inches(0.55), y, Inches(7.5), Inches(0.6), PANEL, line=BORDER, corner=0.15)
            tcol = TEXT
            sub = TEXT3
        add_rect(s, Inches(0.7), y + Inches(0.1), Inches(0.4), Inches(0.4),
                 PANEL_2 if not primary else RGBColor(0xFF, 0xFF, 0xFF), corner=0.25)
        add_text(s, Inches(0.7), y + Inches(0.1), Inches(0.4), Inches(0.4),
                 ic, size=14, color=c, bold=True, align="center", anchor="middle")
        add_text(s, Inches(1.25), y + Inches(0.05), Inches(2.5), Inches(0.3),
                 t, size=10, color=sub, bold=True)
        add_text(s, Inches(1.25), y + Inches(0.3), Inches(6), Inches(0.3),
                 v, size=13, color=tcol, bold=True, font="JetBrains Mono")

    # 右侧轨道环（简化）
    import math
    cx, cy = Inches(10.8), Inches(4.0)
    for r_in in [2.4, 1.8, 1.2]:
        r = Inches(r_in)
        ring = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - r, cy - r, r * 2, r * 2)
        ring.fill.background()
        ring.line.color.rgb = BORDER
        ring.line.width = Pt(0.5)
        ring.line.dash_style = 7
    core_r = Inches(0.95)
    core = s.shapes.add_shape(MSO_SHAPE.OVAL, cx - core_r, cy - core_r, core_r * 2, core_r * 2)
    core.fill.solid()
    core.fill.fore_color.rgb = C_BLUE
    core.line.fill.background()
    add_text(s, cx - Inches(0.9), cy - Inches(0.35), Inches(1.8), Inches(0.4),
             "Get", size=18, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True, align="center")
    add_text(s, cx - Inches(0.9), cy - Inches(0.05), Inches(1.8), Inches(0.4),
             "Started", size=18, color=RGBColor(0xFF, 0xFF, 0xFF), bold=True, align="center")
    nodes = [("5 min", 90), ("5 容器", 0), ("演示数据", -90), ("Apache 2.0", 180)]
    rad = Inches(1.8)
    for label, ang in nodes:
        rx = cx + int(rad * math.cos(math.radians(ang))) - Inches(0.36)
        ry = cy - int(rad * math.sin(math.radians(ang))) - Inches(0.36)
        add_rect(s, rx, ry, Inches(0.72), Inches(0.72), PANEL, line=C_CYAN, corner=0.25)
        add_text(s, rx, ry, Inches(0.72), Inches(0.72),
                 label, size=8, color=C_CYAN, bold=True, align="center", anchor="middle")

    # 底部
    add_text(s, Inches(0.55), Inches(6.6), Inches(7), Inches(0.3),
             "© 2026 中山市中盈互联网科技有限公司 · Apache License 2.0", size=10, color=TEXT3)
    add_text(s, Inches(7.5), Inches(6.6), Inches(5.3), Inches(0.3),
             "Thank you · 感谢观看", size=12, color=C_CYAN, bold=True, align="right")


# ============ 生成 ============
slide_cover()
slide_pain()
slide_position()
slide_overview()
slide_scheduler()
slide_objectives()
slide_modules()
slide_arch()
slide_trace()
slide_quality()
slide_vs()
slide_roadmap()
slide_quickstart()
slide_cta()

out = Path(__file__).resolve().parent.parent / "20260518-AIMes-V1-宣传画册.pptx"
prs.save(str(out))
print(f"OK · {out}  ·  {len(prs.slides)} slides")
