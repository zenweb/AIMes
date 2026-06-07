import http from './http'
import type { BarcodeScanEvidenceRecord } from '../utils/barcode-scan-evidence-sync'
import type { LaborQualificationBlockRecord, LaborReassignmentRecord } from '../utils/labor-assignment-sync'
import type { QualityCapaClosure } from '../utils/quality-capa-sync'

export async function queryLaborReassignments(take = 12): Promise<LaborReassignmentRecord[]> {
  try {
    const { data } = await http.get<LaborReassignmentRecord[]>('/scheduling/labor-reassignments', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function upsertLaborReassignment(item: LaborReassignmentRecord): Promise<LaborReassignmentRecord> {
  const { data } = await http.post<LaborReassignmentRecord>('/scheduling/labor-reassignments', item)
  return data
}

export async function queryLaborQualificationBlocks(take = 12): Promise<LaborQualificationBlockRecord[]> {
  try {
    const { data } = await http.get<LaborQualificationBlockRecord[]>('/scheduling/labor-qualification-blocks', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function upsertLaborQualificationBlock(item: LaborQualificationBlockRecord): Promise<LaborQualificationBlockRecord> {
  const { data } = await http.post<LaborQualificationBlockRecord>('/scheduling/labor-qualification-blocks', item)
  return data
}

export async function queryBarcodeScanEvidence(take = 20): Promise<BarcodeScanEvidenceRecord[]> {
  try {
    const { data } = await http.get<BarcodeScanEvidenceRecord[]>('/scheduling/barcode-scan-evidence', { params: { take } })
    return data
  } catch {
    return []
  }
}

export async function upsertBarcodeScanEvidence(item: BarcodeScanEvidenceRecord): Promise<BarcodeScanEvidenceRecord> {
  const { data } = await http.post<BarcodeScanEvidenceRecord>('/scheduling/barcode-scan-evidence', item)
  return data
}

export async function getLatestQualityCapaClosure(): Promise<QualityCapaClosure | null> {
  try {
    const { data } = await http.get<QualityCapaClosure>('/scheduling/quality-capa-closure/latest')
    return data
  } catch {
    return null
  }
}

export async function upsertQualityCapaClosure(item: QualityCapaClosure): Promise<QualityCapaClosure> {
  const { data } = await http.post<QualityCapaClosure>('/scheduling/quality-capa-closure', item)
  return data
}
