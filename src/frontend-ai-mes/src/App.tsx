import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Factory,
  Gauge,
  GitBranch,
  LayoutDashboard,
  PackageCheck,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Truck,
  UserRoundCog,
  Wrench,
} from 'lucide-react'

type Status = 'normal' | 'warning' | 'danger' | 'ai'

const navItems = [
  { icon: LayoutDashboard, label: '指挥中心', active: true },
  { icon: CalendarClock, label: 'AI 排产' },
  { icon: GitBranch, label: '工艺与 BOM' },
  { icon: PackageCheck, label: '齐套与库存' },
  { icon: ClipboardCheck, label: '质量闭环' },
  { icon: Wrench, label: '设备维护' },
  { icon: ShieldAlert, label: '异常处置' },
  { icon: Truck, label: '采购协同' },
  { icon: UserRoundCog, label: '角色工作台' },
  { icon: Settings, label: '系统设置' },
]

const commandFlow = [
  { label: '订单', value: '18', status: 'normal' },
  { label: 'BOM 展开', value: '18/18', status: 'normal' },
  { label: '工艺路线', value: '17/18', status: 'warning' },
  { label: '物料齐套', value: '14/18', status: 'warning' },
  { label: '产能校验', value: '92%', status: 'normal' },
  { label: 'AI 排产', value: '3 案', status: 'ai' },
  { label: '下发执行', value: '11', status: 'normal' },
  { label: '质检/异常', value: '5', status: 'danger' },
] satisfies Array<{ label: string; value: string; status: Status }>

const aiPlans = [
  { name: '平衡交期', score: 93, late: '1 单', utilization: '86%', risk: '低', selected: true },
  { name: '瓶颈优先', score: 89, late: '2 单', utilization: '91%', risk: '中', selected: false },
  { name: '最小换型', score: 84, late: '3 单', utilization: '82%', risk: '低', selected: false },
]

const anomalies = [
  { title: 'CNC-02 主轴温升异常', owner: '设备工程师', action: '停机检查冷却回路', severity: '紧急' },
  { title: 'B200 热处理硬度波动', owner: '质量工程师', action: '隔离同炉批次并复测', severity: '严重' },
  { title: 'A100 密封圈低于安全库存', owner: '仓储主管', action: '切换供应商加急采购', severity: '一般' },
]

const roleQueues = [
  { role: '调度员', count: 6, focus: '插单重排、瓶颈设备负载' },
  { role: '车间主管', count: 11, focus: '今日派工、异常升级' },
  { role: '质检员', count: 8, focus: '首件检验、SPC 漂移' },
  { role: '设备工程师', count: 4, focus: '预测维护、停机恢复' },
  { role: '采购/仓储', count: 7, focus: '缺料预警、到货齐套' },
]

function statusClass(status: Status) {
  return {
    normal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    ai: 'border-blue-200 bg-blue-50 text-blue-700',
  }[status]
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white">
            <Factory size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold">AIMes</div>
            <div className="text-xs text-slate-500">AI Manufacturing OS</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                item.active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <Bot size={16} />
              AI Agent 在线
            </div>
            <p className="mt-1 text-xs leading-5 text-blue-700">正在监控 18 个工单、7 个约束冲突和 3 个风险场景。</p>
          </div>
        </div>
      </aside>
      <div className="pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex w-[460px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="搜索工单、设备、物料、异常、AI 决策记录"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">早班 08:00-20:00</div>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              生成重排方案
            </button>
          </div>
        </header>
        <main className="px-6 py-5">{children}</main>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, note }: { icon: typeof Activity; label: string; value: string; note: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-600">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">{note}</div>
    </section>
  )
}

function CommandFlow() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">生产主链路</h2>
          <p className="mt-1 text-sm text-slate-500">从订单到重排的端到端执行状态。</p>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
          查看链路详情 <ArrowRight size={15} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-2">
        {commandFlow.map((step, index) => (
          <div key={step.label} className="relative">
            <div className={`rounded-md border px-3 py-3 ${statusClass(step.status)}`}>
              <div className="text-xs">{step.label}</div>
              <div className="mt-1 text-lg font-semibold">{step.value}</div>
            </div>
            {index < commandFlow.length - 1 ? (
              <div className="absolute right-[-9px] top-1/2 z-10 h-px w-4 bg-slate-300" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function AiSchedulingPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles size={18} className="text-blue-600" />
            AI 排产中心
          </h2>
          <p className="mt-1 text-sm text-slate-500">比较策略、解释约束，并给出可采纳方案。</p>
        </div>
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">3 个候选方案</span>
      </div>
      <div className="mt-4 space-y-3">
        {aiPlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-md border p-3 ${plan.selected ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{plan.name}</div>
              <div className="text-xl font-semibold">{plan.score}</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <span>延期 {plan.late}</span>
              <span>稼动 {plan.utilization}</span>
              <span>风险 {plan.risk}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        解释：WO-20260518-009 受 MAT-A04 缺料影响，AI 建议优先下发 B200 批次并保留 CNC-02 维护窗口。
      </div>
    </section>
  )
}

function AnomalyLoop() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">AI 异常闭环</h2>
        <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">3 项待处置</span>
      </div>
      <div className="mt-4 space-y-3">
        {anomalies.map((item) => (
          <div key={item.title} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{item.title}</div>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs">{item.severity}</span>
            </div>
            <div className="mt-2 text-sm text-slate-600">{item.action}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>负责人：{item.owner}</span>
              <span>待采纳</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RoleWorkspace() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">角色工作台</h2>
        <button className="text-sm text-blue-700 hover:text-blue-900">配置角色视图</button>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-3">
        {roleQueues.map((queue) => (
          <div key={queue.role} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{queue.role}</div>
              <div className="rounded-md bg-slate-100 px-2 py-1 text-xs">{queue.count}</div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{queue.focus}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FactoryMap() {
  const cells = [
    ['CNC-01', '运行', 'bg-emerald-500'],
    ['CNC-02', '维护', 'bg-amber-500'],
    ['HT-01', '排队', 'bg-blue-500'],
    ['ASM-01', '运行', 'bg-emerald-500'],
    ['QC-01', '异常', 'bg-red-500'],
    ['PKG-01', '空闲', 'bg-slate-400'],
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">工厂实时态势</h2>
        <span className="text-xs text-slate-500">刷新于 14:08:32</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {cells.map(([name, status, color]) => (
          <div key={name} className="rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{name}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className={`h-2 rounded-full ${color}`} style={{ width: status === '空闲' ? '28%' : '72%' }} />
            </div>
            <div className="mt-2 text-xs text-slate-500">{status}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function App() {
  return (
    <AppShell>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI MES 指挥中心</h1>
          <p className="mt-2 text-sm text-slate-500">围绕交期、产能、质量、设备和物料约束的实时决策工作台。</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <BadgeCheck size={16} />
          当前方案可按时交付 94%
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={TimerReset} label="今日待交付" value="18 单" note="1 单存在延期风险" />
        <MetricCard icon={Gauge} label="设备综合稼动" value="86%" note="CNC-02 触发维护窗口" />
        <MetricCard icon={Boxes} label="物料齐套率" value="78%" note="4 个工单需采购协同" />
        <MetricCard icon={AlertTriangle} label="开放异常" value="5 项" note="2 项需要主管确认" />
      </div>

      <div className="mt-4">
        <CommandFlow />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <AiSchedulingPanel />
        </div>
        <div className="col-span-4">
          <AnomalyLoop />
        </div>
        <div className="col-span-4">
          <FactoryMap />
        </div>
      </div>

      <div className="mt-4">
        <RoleWorkspace />
      </div>
    </AppShell>
  )
}
