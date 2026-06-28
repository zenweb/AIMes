import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getLlmConfig, getLlmStatus } from '../../src/api/llm'

const httpGet = vi.hoisted(() => vi.fn())

vi.mock('../../src/api/http', () => ({
  default: {
    get: httpGet,
  },
}))

describe('llm api contract', () => {
  beforeEach(() => {
    httpGet.mockReset()
  })

  it('reads model status from the backend LLM status endpoint', async () => {
    const status = {
      provider: 'Ollama',
      model: 'qwen2.5',
      reachable: true,
      version: '0.3.14',
    }
    httpGet.mockResolvedValueOnce({ data: status })

    await expect(getLlmStatus()).resolves.toBe(status)

    expect(httpGet).toHaveBeenCalledWith('/llm/status')
  })

  it('reads model provider configuration from the backend LLM config endpoint', async () => {
    const config = {
      provider: 'Ollama',
      ollama: {
        baseUrl: 'http://localhost:11434',
        model: 'qwen2.5',
      },
      azureOpenAI: {
        endpoint: 'https://example.openai.azure.com',
        deploymentName: 'gpt-4o-mini',
      },
      openAI: {
        modelId: 'gpt-4o-mini',
      },
    }
    httpGet.mockResolvedValueOnce({ data: config })

    await expect(getLlmConfig()).resolves.toBe(config)

    expect(httpGet).toHaveBeenCalledWith('/llm/config')
  })
})
