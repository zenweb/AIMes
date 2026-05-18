export interface NavItem {
  path: string
  label: string
  group?: string
  divider?: boolean
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: '生产概览', group: '指挥中心' },
  { path: '/monitoring', label: '实时监控', group: '指挥中心' },
  { path: '/report', label: '报表中心', group: '指挥中心' },
  { path: '/scheduling', label: 'AI 排产', group: '计划执行' },
  { path: '/production', label: '生产报工', group: '计划执行' },
  { path: '/risk', label: '风险预警', group: '计划执行' },
  { path: '/bom', label: 'BOM 管理', group: '工程数据' },
  { path: '/routing', label: '工艺路线', group: '工程数据' },
  { path: '/quality', label: '质量闭环', group: '质量异常' },
  { path: '/anomaly', label: '异常管理', group: '质量异常' },
  { path: '/equipment', label: '设备维护', group: '资源协同' },
  { path: '/inventory', label: '库存齐套', group: '资源协同' },
  { path: '/purchase', label: '采购协同', group: '资源协同' },
  { path: '/employee', label: '人员管理', group: '系统运营' },
  { path: '/barcode', label: '条码打印', group: '系统运营' },
  { path: '/scanner', label: '条码扫描', group: '系统运营' },
  { path: '/knowledge/documents', label: '文档上传', group: '系统运营' },
  { path: '/admin', label: '系统管理', group: '系统运营' },
  { path: '/audit-logs', label: '审计日志', group: '系统运营' },
]
