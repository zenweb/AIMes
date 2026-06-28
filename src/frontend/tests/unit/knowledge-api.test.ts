import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getChatHistory, queryKnowledge, uploadDocument } from '../../src/api/knowledge'

const httpGet = vi.hoisted(() => vi.fn())
const httpPost = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
    post: httpPost,
  },
}))

describe('knowledge api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
    httpPost.mockReset()
    httpGet.mockResolvedValue({ data: {} })
    httpPost.mockResolvedValue({ data: {} })
  })

  it('uses backend contract paths for knowledge query and chat history', async () => {
    const request = {
      question: '这批返工的根因是什么？',
      sessionId: 'session-001',
      context: { workOrderId: 'WO-001' },
    }
    httpPost.mockResolvedValueOnce({ data: { answer: '根因为夹具磨损', sources: [] } })
    httpGet.mockResolvedValueOnce({ data: { messages: [] } })

    await queryKnowledge(request)
    await getChatHistory('session-001', 12)

    expect(httpPost).toHaveBeenCalledWith('/knowledge/query', request)
    expect(httpGet).toHaveBeenCalledWith('/knowledge/chat-history/session-001', {
      params: { maxMessages: 12 },
    })
  })

  it('uploads documents as multipart form data with category and extended timeout', async () => {
    const file = new File(['作业指导书'], 'wi-001.pdf', { type: 'application/pdf' })
    httpPost.mockResolvedValueOnce({ data: { documentId: 'doc-001', status: 'indexed' } })

    await uploadDocument(file, 'SOP')

    const [path, formData, config] = httpPost.mock.calls[0]
    expect(path).toBe('/knowledge/documents')
    expect(formData).toBeInstanceOf(FormData)
    expect((formData as FormData).get('file')).toBe(file)
    expect((formData as FormData).get('category')).toBe('SOP')
    expect(config).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
  })
})
