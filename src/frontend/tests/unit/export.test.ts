import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportToCsv } from '../../src/utils/export'

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('exportToCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('escapes csv headers so audit exports keep stable columns', async () => {
    let capturedBlob: Blob | null = null
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    })
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob
      return 'blob:audit-export'
    })
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    exportToCsv(
      '审计导出',
      ['工单,编号', '备注"说明', '换行\n字段'],
      [['WO-1', '正常', 'OK']]
    )

    if (!capturedBlob) {
      throw new Error('exportToCsv did not create a CSV blob')
    }
    const csv = await readBlobText(capturedBlob)

    expect(csv).toBe('"工单,编号","备注""说明","换行\n字段"\nWO-1,正常,OK')
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeSpy).toHaveBeenCalledWith('blob:audit-export')
  })
})
