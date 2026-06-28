import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EmployeeBoard from '../../src/components/employee/EmployeeBoard.vue'
import type { Employee } from '../../src/types/employee'

const getEmployeeList = vi.hoisted(() => vi.fn())
const createEmployee = vi.hoisted(() => vi.fn())
const updateEmployee = vi.hoisted(() => vi.fn())
const deactivateEmployee = vi.hoisted(() => vi.fn())
const exportToCsv = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/employee', () => ({
  createEmployee,
  deactivateEmployee,
  getEmployeeList,
  updateEmployee,
}))

vi.mock('../../src/utils/export', () => ({
  exportToCsv,
}))

const employees: Employee[] = [
  {
    id: 'emp-001',
    employeeNumber: 'EMP-001',
    name: '张三',
    role: 'Operator',
    team: '甲班',
    shift: 'Day',
    phone: '13800138001',
    email: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00',
  },
  {
    id: 'emp-002',
    employeeNumber: 'EMP-002',
    name: '李四',
    role: 'Engineer',
    team: '技术组',
    shift: 'Day',
    phone: null,
    email: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00',
  },
]

function mountEmployeeBoard(options: { attachTo?: HTMLElement } = {}) {
  return mount(EmployeeBoard, {
    attachTo: options.attachTo,
    global: {
      stubs: {
        SkillMatrixPanel: true,
      },
    },
  })
}

describe('EmployeeBoard', () => {
  beforeEach(() => {
    getEmployeeList.mockResolvedValue({ items: employees, totalCount: employees.length })
    createEmployee.mockResolvedValue({})
    updateEmployee.mockResolvedValue({})
    deactivateEmployee.mockResolvedValue({})
  })

  it('lets keyboard users open employee details from employee cards', async () => {
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    const cards = wrapper.findAll('.emp-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].attributes('role')).toBe('button')
    expect(cards[0].attributes('tabindex')).toBe('0')
    expect(cards[0].attributes('aria-label')).toBe('查看员工详情：EMP-001 张三')

    await cards[0].trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.get('.modal-content h3').text()).toBe('编辑员工')
    expect(wrapper.get<HTMLInputElement>('.form-input').element.value).toBe('EMP-001')
  })

  it('labels employee edit and create dialogs as modal dialogs for screen readers', async () => {
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('click')
    await flushPromises()

    const editDialog = wrapper.get('[role="dialog"]')
    expect(editDialog.attributes('aria-modal')).toBe('true')
    expect(editDialog.attributes('aria-labelledby')).toBe('employee-edit-dialog-title')
    expect(wrapper.get('#employee-edit-dialog-title').text()).toBe('编辑员工')
    expect(editDialog.get('.btn-cancel').attributes('aria-label')).toBe('关闭员工编辑')

    await wrapper.get('.btn-add').trigger('click')
    await flushPromises()

    const createDialog = wrapper.findAll('[role="dialog"]').find((dialog) =>
      dialog.attributes('aria-labelledby') === 'employee-create-dialog-title',
    )
    expect(createDialog?.attributes('aria-modal')).toBe('true')
    expect(wrapper.get('#employee-create-dialog-title').text()).toBe('新增员工')
    expect(createDialog?.get('.btn-cancel').attributes('aria-label')).toBe('取消新增员工')
  })

  it('returns focus to the employee card after closing edit dialog with Escape', async () => {
    const wrapper = mountEmployeeBoard({ attachTo: document.body })
    await flushPromises()

    const firstCard = wrapper.get<HTMLElement>('.emp-card')
    firstCard.element.focus()
    await firstCard.trigger('keydown.enter')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await wrapper.get('[role="dialog"]').trigger('keydown.escape')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(firstCard.element)

    wrapper.unmount()
  })

  it('returns focus to the add button after closing create dialog with Escape', async () => {
    const wrapper = mountEmployeeBoard({ attachTo: document.body })
    await flushPromises()

    const addButton = wrapper.get<HTMLElement>('.btn-add')
    addButton.element.focus()
    await addButton.trigger('click')
    await flushPromises()

    const createDialog = wrapper.get<HTMLElement>('[role="dialog"]')
    expect(createDialog.attributes('aria-labelledby')).toBe('employee-create-dialog-title')
    expect(document.activeElement).toBe(createDialog.element)

    await createDialog.trigger('keydown.escape')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(addButton.element)

    wrapper.unmount()
  })

  it('announces when employee list loading falls back to demo data', async () => {
    getEmployeeList.mockRejectedValueOnce(new Error('employee list API unavailable'))
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-001')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('员工列表加载失败')
    expect(alert.text()).toContain('当前展示本地示例数据')
    expect(alert.text()).toContain('employee list API unavailable')
  })

  it('uses local demo employees without surfacing backend skip errors in offline demo mode', async () => {
    const offlineDemoError = new Error('Offline demo mode skipped backend request: /api/v1/employee')
    offlineDemoError.name = 'OfflineDemoApiError'
    getEmployeeList.mockRejectedValueOnce(offlineDemoError)

    const wrapper = mountEmployeeBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-001')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps local demo employees quiet when the HTTP layer wraps offline demo skip errors', async () => {
    getEmployeeList.mockRejectedValueOnce(new Error('Request failed: Offline demo mode skipped backend request: /api/v1/employee'))

    const wrapper = mountEmployeeBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-001')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('员工列表加载失败')
    expect(wrapper.text()).not.toContain('Offline demo mode skipped backend request')
  })

  it('keeps create dialog open and does not add a local employee when create api fails', async () => {
    createEmployee.mockRejectedValueOnce(new Error('employee create API unavailable'))
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[0].setValue('EMP-900')
    await inputs[1].setValue('测试员工')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createEmployee).toHaveBeenCalledWith(expect.objectContaining({
      employeeNumber: 'EMP-900',
      name: '测试员工',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('EMP-900')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('员工创建失败')
    expect(alert.text()).toContain('employee create API unavailable')
  })

  it('adds the backend-created employee to the visible list after create succeeds', async () => {
    createEmployee.mockResolvedValueOnce({
      id: 'emp-900',
      employeeNumber: 'EMP-900',
      name: '测试员工',
      role: 'Operator',
      team: '甲班',
      shift: 'Day',
      phone: '13900139000',
      email: null,
      isActive: true,
      createdAt: '2026-06-05T00:00:00',
    } satisfies Employee)
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.btn-add').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[0].setValue('EMP-900')
    await inputs[1].setValue('测试员工')
    await wrapper.get('.modal-content .btn-ok').trigger('click')
    await flushPromises()

    expect(createEmployee).toHaveBeenCalledWith(expect.objectContaining({
      employeeNumber: 'EMP-900',
      name: '测试员工',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('EMP-900')
    expect(wrapper.text()).toContain('测试员工')
  })

  it('keeps edit dialog open and does not locally update employee details when update api fails', async () => {
    updateEmployee.mockRejectedValueOnce(new Error('employee update API unavailable'))
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[1].setValue('张三-误写')
    await wrapper.get('.modal-content .btn-save').trigger('click')
    await flushPromises()

    expect(updateEmployee).toHaveBeenCalledWith('emp-001', expect.objectContaining({
      name: '张三-误写',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).not.toContain('张三-误写')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('员工资料保存失败')
    expect(alert.text()).toContain('employee update API unavailable')
  })

  it('updates the visible employee card with the backend-updated employee after save succeeds', async () => {
    updateEmployee.mockResolvedValueOnce({
      ...employees[0],
      name: '王小明',
      phone: '13900139001',
    })
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('click')
    const inputs = wrapper.findAll<HTMLInputElement>('.modal-content input')
    await inputs[1].setValue('王小明')
    await wrapper.get('.modal-content .btn-save').trigger('click')
    await flushPromises()

    expect(updateEmployee).toHaveBeenCalledWith('emp-001', expect.objectContaining({
      name: '王小明',
    }))
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.text()).toContain('王小明')
    expect(wrapper.text()).not.toContain('张三')
  })

  it('keeps edit dialog open and does not locally deactivate employee when deactivate api fails', async () => {
    deactivateEmployee.mockRejectedValueOnce(new Error('employee deactivate API unavailable'))
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('click')
    await wrapper.get('.modal-content .btn-deact').trigger('click')
    await flushPromises()

    expect(deactivateEmployee).toHaveBeenCalledWith('emp-001')
    expect(wrapper.find('.modal-content').exists()).toBe(true)
    expect(wrapper.findAll('.emp-card')).toHaveLength(2)
    expect(wrapper.text()).toContain('张三')
    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('员工离职失败')
    expect(alert.text()).toContain('employee deactivate API unavailable')
  })

  it('removes the employee from the default active list after deactivate succeeds', async () => {
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('click')
    await wrapper.get('.modal-content .btn-deact').trigger('click')
    await flushPromises()

    expect(deactivateEmployee).toHaveBeenCalledWith('emp-001')
    expect(wrapper.find('.modal-content').exists()).toBe(false)
    expect(wrapper.findAll('.emp-card')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('张三')
    expect(wrapper.text()).toContain('李四')
  })

  it('exports the complete employee roster with active status evidence', async () => {
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.btn-export').trigger('click')

    expect(exportToCsv).toHaveBeenCalledWith(
      '员工列表',
      ['工号', '姓名', '角色', '班组', '班次', '电话', '邮箱', '在职'],
      [
        ['EMP-001', '张三', 'Operator', '甲班', 'Day', '13800138001', '', '是'],
        ['EMP-002', '李四', 'Engineer', '技术组', 'Day', '', '', '是'],
      ],
    )
  })

  it('opens employee details with Space for keyboard-only operators', async () => {
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get('.emp-card').trigger('keydown.space')
    await flushPromises()

    expect(wrapper.get('[role="dialog"]').attributes('aria-labelledby')).toBe('employee-edit-dialog-title')
    expect(wrapper.get('.modal-content h3').text()).toBe('编辑员工')
  })

  it('filters by role, team, search text, and explicit inactive visibility', async () => {
    getEmployeeList.mockResolvedValueOnce({
      items: [
        ...employees,
        {
          id: 'emp-003',
          employeeNumber: 'EMP-003',
          name: '王五',
          role: 'Operator',
          team: '乙班',
          shift: 'Night',
          phone: null,
          email: null,
          isActive: false,
          createdAt: '2026-01-01T00:00:00',
        } satisfies Employee,
      ],
      totalCount: 3,
    })
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    const filters = wrapper.findAll<HTMLSelectElement>('.filter-select')
    await filters[0].setValue('Operator')
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).not.toContain('李四')
    expect(wrapper.text()).not.toContain('王五')

    await filters[1].setValue('乙班')
    expect(wrapper.findAll('.emp-card')).toHaveLength(0)

    await wrapper.get<HTMLInputElement>('.chk input').setValue(true)
    expect(wrapper.get('.emp-card').attributes('aria-label')).toBe('查看离职员工详情：EMP-003 王五')
    expect(wrapper.text()).toContain('离职')

    await wrapper.get<HTMLInputElement>('.search-input').setValue('emp-003')
    expect(wrapper.text()).toContain('王五')
    expect(wrapper.text()).not.toContain('张三')
  })

  it('returns to the first page when search narrows a paginated roster', async () => {
    const manyEmployees: Employee[] = Array.from({ length: 25 }, (_, index) => ({
      id: `emp-${String(index + 1).padStart(3, '0')}`,
      employeeNumber: `EMP-${String(index + 1).padStart(3, '0')}`,
      name: `员工${String(index + 1).padStart(2, '0')}`,
      role: index === 24 ? 'Engineer' : 'Operator',
      team: index === 24 ? '技术组' : '甲班',
      shift: 'Day',
      phone: null,
      email: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00',
    }))
    getEmployeeList.mockResolvedValueOnce({ items: manyEmployees, totalCount: manyEmployees.length })
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-001')
    await wrapper.findAll('.page-btn').at(-1)?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('EMP-001')
    expect(wrapper.text()).toContain('EMP-013')

    await wrapper.get<HTMLInputElement>('.search-input').setValue('EMP-001')
    await flushPromises()

    expect(wrapper.findAll('.emp-card')).toHaveLength(1)
    expect(wrapper.text()).toContain('EMP-001')
    expect(wrapper.find('.pagination-bar').exists()).toBe(false)
  })

  it('shows inactive employee details as read-only without save or deactivate actions', async () => {
    getEmployeeList.mockResolvedValueOnce({
      items: [
        {
          ...employees[0],
          id: 'emp-003',
          employeeNumber: 'EMP-003',
          name: '王五',
          isActive: false,
        },
      ],
      totalCount: 1,
    })
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    await wrapper.get<HTMLInputElement>('.chk input').setValue(true)
    await wrapper.get('.emp-card').trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-labelledby')).toBe('employee-detail-dialog-title')
    expect(wrapper.get('#employee-detail-dialog-title').text()).toBe('员工详情')
    expect(wrapper.find('.btn-save').exists()).toBe(false)
    expect(wrapper.find('.btn-deact').exists()).toBe(false)
    expect(wrapper.findAll<HTMLInputElement>('.modal-content input').every(input => input.element.disabled)).toBe(true)
  })

  it('keeps long pagination stable with ellipsis, previous, and next controls', async () => {
    const manyEmployees: Employee[] = Array.from({ length: 100 }, (_, index) => ({
      id: `emp-${String(index + 1).padStart(3, '0')}`,
      employeeNumber: `EMP-${String(index + 1).padStart(3, '0')}`,
      name: `员工${String(index + 1).padStart(2, '0')}`,
      role: 'Operator',
      team: '甲班',
      shift: 'Day',
      phone: null,
      email: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00',
    }))
    getEmployeeList.mockResolvedValueOnce({ items: manyEmployees, totalCount: manyEmployees.length })
    const wrapper = mountEmployeeBoard()
    await flushPromises()

    expect(wrapper.find('.page-ellipsis').exists()).toBe(true)
    for (let i = 0; i < 3; i += 1) {
      await wrapper.findAll('.page-btn').find(button => button.text() === '下一页')?.trigger('click')
      await flushPromises()
    }

    expect(wrapper.text()).toContain('EMP-037')
    expect(wrapper.text()).not.toContain('EMP-001')
    expect(wrapper.findAll('.page-ellipsis')).toHaveLength(2)

    await wrapper.findAll('.page-btn').find(button => button.text() === '上一页')?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-025')

    await wrapper.findAll('.page-btn').find(button => button.text() === '下一页')?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('EMP-037')
  })
})
