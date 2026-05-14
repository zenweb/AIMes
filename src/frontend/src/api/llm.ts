import http from './http'

export interface LlmStatus {
  provider: string
  model: string
  reachable: boolean
  version?: string
  error?: string
}

export interface LlmConfig {
  provider: string
  ollama: {
    baseUrl: string
    model: string
  }
  azureOpenAI: {
    endpoint: string
    deploymentName: string
  }
  openAI: {
    modelId: string
  }
}

// 获取 LLM 状态
export async function getLlmStatus(): Promise<LlmStatus> {
  const { data } = await http.get<LlmStatus>('/llm/status')
  return data
}

// 获取 LLM 配置
export async function getLlmConfig(): Promise<LlmConfig> {
  const { data } = await http.get<LlmConfig>('/llm/config')
  return data
}
