import { afterEach, describe, expect, it, vi } from 'vitest'
import { useExport } from '../../src/composables/useExport'

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('useExport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('escapes csv headers so schedule and report exports keep stable columns', async () => {
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
      return 'blob:use-export'
    })
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    let scheduledRevoke: (() => void) | undefined
    vi.spyOn(window, 'setTimeout').mockImplementation((handler: TimerHandler) => {
      scheduledRevoke = typeof handler === 'function' ? handler : () => undefined
      return 1
    })
    const { downloadCsv } = useExport()

    downloadCsv(
      '排产审计.csv',
      ['工单,编号', '备注"说明', '换行\n字段'],
      [['WO-1', '正常', 'OK']]
    )

    if (!capturedBlob) {
      throw new Error('downloadCsv did not create a CSV blob')
    }
    const csv = await readBlobText(capturedBlob)

    expect(csv).toBe('"工单,编号","备注""说明","换行\n字段"\r\n"WO-1","正常","OK"')
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeSpy).not.toHaveBeenCalled()

    scheduledRevoke?.()

    expect(revokeSpy).toHaveBeenCalledWith('blob:use-export')
  }, 2000)
})
