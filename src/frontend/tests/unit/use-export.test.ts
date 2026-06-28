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

  it('generates timestamped csv filenames so exported evidence files are traceable', () => {
    try {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 5, 15, 9, 7, 0))
      const { csvFilename } = useExport()

      expect(csvFilename('排产计划')).toBe('排产计划-20260615-0907.csv')
    } finally {
      vi.useRealTimers()
    }
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
  }, 15000)

  it('escapes every csv data cell and removes the temporary download link after clicking', async () => {
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
      return 'blob:use-export-rows'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    vi.spyOn(window, 'setTimeout').mockImplementation(() => 1)
    const { downloadCsv } = useExport()

    downloadCsv(
      '报表.csv',
      ['指标', '说明'],
      [
        ['OTD,改善', '客户说 "可复盘"'],
        ['换行字段', '第一行\n第二行'],
      ],
    )

    if (!capturedBlob) {
      throw new Error('downloadCsv did not create a CSV blob')
    }
    const csv = await readBlobText(capturedBlob)

    expect(csv).toBe([
      '"指标","说明"',
      '"OTD,改善","客户说 ""可复盘"""',
      '"换行字段","第一行\n第二行"',
    ].join('\r\n'))
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(document.body.querySelector('a[download="报表.csv"]')).toBeNull()
  }, 15000)
})
