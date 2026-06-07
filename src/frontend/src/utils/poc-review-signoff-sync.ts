import { upsertOtdEvidenceChainRecord } from './otd-evidence-chain-sync'
import { getLatestPocReviewSignoff, upsertPocReviewSignoff } from '../api/pocEvidence'

const STORAGE_KEY = 'aimes_poc_review_signoff'

export interface PocReviewSignoffRecord {
  id: string
  meetingId: string
  targetCustomer: string
  totalScore: number
  passScore: number
  result: 'approved'
  signedBy: string
  signedAt: string
  reviewers: string[]
  evidenceBatches: string[]
  auditId: string
  summary: string
}

function canUseStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function isPocReviewSignoffRecord(
  record: Partial<PocReviewSignoffRecord> | null | undefined
): record is PocReviewSignoffRecord {
  return !!record
    && typeof record.id === 'string'
    && typeof record.meetingId === 'string'
    && typeof record.targetCustomer === 'string'
    && typeof record.totalScore === 'number'
    && typeof record.passScore === 'number'
    && record.result === 'approved'
    && typeof record.signedBy === 'string'
    && typeof record.signedAt === 'string'
    && Array.isArray(record.reviewers)
    && Array.isArray(record.evidenceBatches)
    && typeof record.auditId === 'string'
    && typeof record.summary === 'string'
}

export function readPocReviewSignoffRecord(): PocReviewSignoffRecord | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (isPocReviewSignoffRecord(parsed)) return parsed
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export async function readPocReviewSignoffRecordBackendFirst(): Promise<PocReviewSignoffRecord | null> {
  const record = await getLatestPocReviewSignoff()
  return record ?? readPocReviewSignoffRecord()
}

export function writePocReviewSignoffRecord(input: Partial<PocReviewSignoffRecord>) {
  if (!canUseStorage()) return null
  const record: PocReviewSignoffRecord = {
    id: input.id ?? 'poc-review-signoff-20260520',
    meetingId: input.meetingId ?? 'POC-REVIEW-20260520-001',
    targetCustomer: input.targetCustomer ?? '离散制造工厂 POC',
    totalScore: input.totalScore ?? 100,
    passScore: input.passScore ?? 85,
    result: 'approved',
    signedBy: input.signedBy ?? '项目经理 / 客户代表',
    signedAt: input.signedAt ?? new Date().toISOString(),
    reviewers: input.reviewers ?? ['客户厂长', 'MES 项目经理', '调度主管', '设备主管'],
    evidenceBatches: input.evidenceBatches ?? [],
    auditId: input.auditId ?? 'AUD-POC-REVIEW-20260520',
    summary: input.summary ?? 'POC 验收证据齐套，评分达到通过线，进入复盘签署。',
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  void upsertPocReviewSignoff(record).catch(() => undefined)
  upsertOtdEvidenceChainRecord({
    id: 'poc-signoff',
    stage: '复盘归档',
    title: 'POC 复盘会评分表已签署',
    summary: record.summary,
    object: record.meetingId,
    source: record.signedBy,
    traceId: record.auditId,
    status: 'closed',
    statusLabel: '已签署',
    createdAt: record.signedAt,
  })
  return record
}
