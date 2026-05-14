import type { RouteMeta } from 'vue-router'

export interface NavItem {
  path: string
  label: string
  meta?: RouteMeta
  divider?: boolean
}

export const navItems: NavItem[] = [
  { path: '/dashboard', label: '生产概览' },
  { path: '/scheduling', label: '排产甘特图' },
  { path: '/risk', label: '风险预警', meta: { requiresAuth: true } as RouteMeta },
  { path: '/quality', label: '质量管理' },
  { path: '/equipment', label: '设备管理' },
  { path: '/production', label: '生产报工' },
  { path: '/bom', label: 'BOM 管理' },
  { path: '/routing', label: '工艺路线' },
  { path: '/anomaly', label: '异常管理' },
  { path: '/knowledge/documents', label: '文档上传' },
  { path: '/inventory', label: '库存管理' },
  { path: '/purchase', label: '采购管理' },
  { path: '/employee', label: '人员管理' },
  { path: '/barcode', label: '条码打印' },
  { path: '/scanner', label: '条码扫描' },
  { path: '/admin', label: '系统管理' },
  { path: '/audit-logs', label: '审计日志' },
  { path: '/monitoring', label: '实时监控' },
  { path: '/report', label: '报表中心' },
]
