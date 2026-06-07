import { beforeEach, describe, expect, it } from 'vitest'
import { installMemoryLocalStorage } from './test-storage'
import { getLocalUserDisplayName, getLocalUserReportActor, getLocalUserRole } from '../../src/utils/local-user'

describe('local user parsing', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    localStorage.clear()
  })

  it('clears malformed cached users so role checks do not reuse stale identity', () => {
    localStorage.setItem('aimes_user', '{bad json')

    expect(getLocalUserRole()).toBeNull()
    expect(getLocalUserDisplayName('现场操作员')).toBe('现场操作员')
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })

  it('ignores blank role and display names because audit records need a readable actor', () => {
    localStorage.setItem('aimes_user', JSON.stringify({
      username: '   ',
      displayName: '   ',
      role: '   ',
    }))

    expect(getLocalUserRole()).toBeNull()
    expect(getLocalUserDisplayName('现场操作员')).toBe('现场操作员')
  })

  it('normalizes cached role whitespace so route authorization matches backend role names', () => {
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      role: '  Admin  ',
    }))

    expect(getLocalUserRole()).toBe('Admin')
  })

  it('normalizes cached actor names before writing audit and report signatures', () => {
    localStorage.setItem('aimes_user', JSON.stringify({
      username: '  report.admin  ',
      displayName: '  报表管理员  ',
      role: 'Admin',
    }))

    expect(getLocalUserDisplayName('现场操作员')).toBe('报表管理员')
    expect(getLocalUserReportActor()).toBe('report.admin')
  })

  it('uses username first for report actor signatures and clears malformed cached users', () => {
    localStorage.setItem('aimes_user', JSON.stringify({
      username: 'report.admin',
      displayName: '报表管理员',
      role: 'Admin',
    }))

    expect(getLocalUserReportActor()).toBe('report.admin')

    localStorage.setItem('aimes_user', '{bad json')

    expect(getLocalUserReportActor()).toBe('report.viewer')
    expect(localStorage.getItem('aimes_user')).toBeNull()
  })
})
