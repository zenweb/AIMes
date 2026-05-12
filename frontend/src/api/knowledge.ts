import axios from 'axios'
import type { KnowledgeQueryRequest, KnowledgeQueryResponse, ChatHistoryResponse, DocumentUploadResponse } from '../types/knowledge'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

export async function queryKnowledge(request: KnowledgeQueryRequest): Promise<KnowledgeQueryResponse> {
  const { data } = await http.post<KnowledgeQueryResponse>('/knowledge/query', request)
  return data
}

export async function getChatHistory(sessionId: string, maxMessages = 20): Promise<ChatHistoryResponse> {
  const { data } = await http.get<ChatHistoryResponse>(`/knowledge/chat-history/${sessionId}`, {
    params: { maxMessages },
  })
  return data
}

export async function uploadDocument(file: File, category?: string): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  if (category) formData.append('category', category)
  const { data } = await http.post<DocumentUploadResponse>('/knowledge/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
  return data
}
