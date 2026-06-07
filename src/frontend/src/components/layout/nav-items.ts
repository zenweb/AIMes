export interface NavItem {
  path: string
  label: string
  group?: string
  icon?: string
  description?: string
  divider?: boolean
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: '生产概览', group: '指挥中心', icon: 'pi pi-th-large', description: 'OTD / OEE / 现场总览' },
  { path: '/monitoring', label: '实时监控', group: '指挥中心', icon: 'pi pi-chart-line', description: '产线态势与异常信号' },
  { path: '/report', label: '报表中心', group: '指挥中心', icon: 'pi pi-chart-bar', description: '经营复盘与 A/B 证据' },
  { path: '/scheduling', label: 'AI 排产', group: '计划执行', icon: 'pi pi-sliders-h', description: '约束排产与方案采纳' },
  { path: '/production', label: '生产报工', group: '计划执行', icon: 'pi pi-play-circle', description: '工序执行与回写' },
  { path: '/risk', label: '风险预警', group: '计划执行', icon: 'pi pi-exclamation-triangle', description: '交付 / 设备 / 物料风险' },
  { path: '/bom', label: 'BOM 管理', group: '工程数据', icon: 'pi pi-sitemap', description: '物料结构与齐套约束' },
  { path: '/routing', label: '工艺路线', group: '工程数据', icon: 'pi pi-share-alt', description: '工序能力与路线校验' },
  { path: '/quality', label: '质量闭环', group: '质量异常', icon: 'pi pi-verified', description: '检验 / MRB / CAPA' },
  { path: '/anomaly', label: '异常管理', group: '质量异常', icon: 'pi pi-bolt', description: '事件分流与闭环' },
  { path: '/equipment', label: '设备维护', group: '资源协同', icon: 'pi pi-cog', description: '稼动率与维修证据' },
  { path: '/inventory', label: '库存齐套', group: '资源协同', icon: 'pi pi-box', description: '库存水位与缺料齐套' },
  { path: '/purchase', label: '采购协同', group: '资源协同', icon: 'pi pi-truck', description: '到货承诺与供应 SLA' },
  { path: '/employee', label: '人员管理', group: '系统运营', icon: 'pi pi-users', description: '班组与资质矩阵' },
  { path: '/barcode', label: '条码打印', group: '系统运营', icon: 'pi pi-qrcode', description: '追溯标签批次' },
  { path: '/scanner', label: '条码扫描', group: '系统运营', icon: 'pi pi-camera', description: '到站 / 点检 / 复核' },
  { path: '/knowledge/documents', label: '文档上传', group: '系统运营', icon: 'pi pi-file-arrow-up', description: 'RAG 文档与知识治理' },
  { path: '/admin', label: '系统管理', group: '系统运营', icon: 'pi pi-shield', description: '权限 / Agent 配置 / 策略' },
  { path: '/audit-logs', label: '审计日志', group: '系统运营', icon: 'pi pi-history', description: '证据链与动作回放' },
]
