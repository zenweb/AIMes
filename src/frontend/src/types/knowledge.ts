export interface KnowledgeQueryRequest {
  question: string
  sessionId?: string
  topK?: number
}

export interface KnowledgeSourceDto {
  sourceId: string
  sourceName: string
  content: string
  relevanceScore: number
}

export interface KnowledgeQueryResponse {
  answer: string
  sessionId: string
  sources: KnowledgeSourceDto[]
  confidence: number
  timestamp: string
}

export interface ChatMessageDto {
  role: string
  content: string
  timestamp: string
  sourceIds: string[]
}

export interface ChatHistoryResponse {
  sessionId: string
  messages: ChatMessageDto[]
  totalCount: number
}

export interface DocumentUploadResponse {
  documentId: string
  fileName: string
  chunkCount: number
  uploadedAt: string
  status: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: KnowledgeSourceDto[]
  actions?: ChatAction[]
  actionPackages?: ChatActionPackage[]
  timestamp: Date
}

export interface ChatAction {
  id: string
  label: string
  type: 'navigate' | 'schedule_suggestion' | 'export_report' | 'create_anomaly_card' | 'delivery_recovery_package' | 'engineering_constraint_package'
  targetRoute?: string
  resultMessage: string
  auditCode?: string
  requiredRole?: string
}

export interface ChatActionPackage {
  id: string
  title: string
  auditCode: string
  traceId: string
  statusLabel: string
  workOrders: string
  otdImpact: string
  owner: string
  dueAt: string
  steps: Array<{
    module: string
    owner: string
    action: string
    evidence: string
  }>
}
