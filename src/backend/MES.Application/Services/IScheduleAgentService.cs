using MES.Application.DTOs;
using MES.Domain.Authorization;

namespace MES.Application.Services;

public interface IScheduleAgentService
{
    Task<AgentDecisionDto> RecommendAsync(AgentRecommendRequest request, string actor, CancellationToken ct = default);
    Task<AgentDecisionDto?> GetDecisionAsync(string decisionId, CancellationToken ct = default);
    Task<List<AgentDecisionDto>> QueryRecentAsync(int take, CancellationToken ct = default);
    Task<AgentDecisionDto> AdoptAsync(string decisionId, string scenarioId, string? reason, string actor, string role, CancellationToken ct = default);
    Task<AgentDecisionDto> RejectAsync(string decisionId, string? reason, string actor, string role, CancellationToken ct = default);

    /// <summary>
    /// 通用 cross-domain Agent 动作执行入口：质量处置/采购动作/维护动作。
    /// 带业务 payload 时执行受控业务写入，并记录 AgentActionResult + AuditLog 供回放。
    /// </summary>
    Task<AgentDecisionDto> ExecuteCrossDomainActionAsync(
        string decisionId,
        AgentActionType action,
        AgentExecuteActionRequest request,
        string actor,
        string role,
        CancellationToken ct = default);

    /// <summary>
    /// 记录 Agent 动作被权限策略拒绝的留痕。
    /// 写 RejectedByPolicy AgentActionResult + AgentPolicyRejected AuditLog。
    /// </summary>
    Task RecordPolicyRejectionAsync(
        AgentActionType action,
        string decisionId,
        string actor,
        string role,
        string? reason,
        CancellationToken ct = default);

    Task<List<OtdEvidenceChainItemDto>> QueryOtdEvidenceAsync(int take, CancellationToken ct = default);
    Task<OtdEvidenceChainItemDto> UpsertOtdEvidenceAsync(OtdEvidenceChainItemDto item, string actor, CancellationToken ct = default);
    Task<EquipmentDowntimeEventDto?> GetLatestEquipmentDowntimeAsync(CancellationToken ct = default);
    Task<EquipmentDowntimeEventDto> UpsertEquipmentDowntimeAsync(EquipmentDowntimeEventDto item, string actor, CancellationToken ct = default);
    Task<CustomerEquipmentFaultEvidenceDto?> GetLatestCustomerEquipmentFaultAsync(CancellationToken ct = default);
    Task<CustomerEquipmentFaultEvidenceDto> UpsertCustomerEquipmentFaultAsync(CustomerEquipmentFaultEvidenceDto item, string actor, CancellationToken ct = default);
    Task<ShortageKittingEventDto?> GetLatestShortageKittingAsync(CancellationToken ct = default);
    Task<ShortageKittingEventDto> UpsertShortageKittingAsync(ShortageKittingEventDto item, string actor, CancellationToken ct = default);
    Task<ShortageRiskResolutionDto?> GetLatestShortageRiskResolutionAsync(CancellationToken ct = default);
    Task<ShortageRiskResolutionDto> UpsertShortageRiskResolutionAsync(ShortageRiskResolutionDto item, string actor, CancellationToken ct = default);
    Task<BomKittingPackageDto?> GetLatestBomKittingPackageAsync(CancellationToken ct = default);
    Task<BomKittingPackageDto> UpsertBomKittingPackageAsync(BomKittingPackageDto item, string actor, CancellationToken ct = default);
    Task<SupplyRiskEscalationDto?> GetLatestSupplyRiskEscalationAsync(CancellationToken ct = default);
    Task<SupplyRiskEscalationDto> UpsertSupplyRiskEscalationAsync(SupplyRiskEscalationDto item, string actor, CancellationToken ct = default);
    Task<SupplierNetworkDecisionDto?> GetLatestSupplierNetworkDecisionAsync(CancellationToken ct = default);
    Task<SupplierNetworkDecisionDto> UpsertSupplierNetworkDecisionAsync(SupplierNetworkDecisionDto item, string actor, CancellationToken ct = default);
    Task<List<OutsourcingCommitmentPackageDto>> QueryOutsourcingCommitmentsAsync(int take, CancellationToken ct = default);
    Task<OutsourcingCommitmentPackageDto?> GetLatestOutsourcingCommitmentAsync(CancellationToken ct = default);
    Task<OutsourcingCommitmentPackageDto> UpsertOutsourcingCommitmentAsync(OutsourcingCommitmentPackageDto item, string actor, CancellationToken ct = default);
    Task<QualityReworkImpactDto?> GetLatestQualityReworkImpactAsync(CancellationToken ct = default);
    Task<QualityReworkImpactDto> UpsertQualityReworkImpactAsync(QualityReworkImpactDto item, string actor, CancellationToken ct = default);
    Task<QualityMrbDispositionRecordDto?> GetLatestQualityMrbDispositionAsync(CancellationToken ct = default);
    Task<QualityMrbDispositionRecordDto> UpsertQualityMrbDispositionAsync(QualityMrbDispositionRecordDto item, string actor, CancellationToken ct = default);
    Task<AlternateMaterialApprovalDto?> GetLatestAlternateMaterialApprovalAsync(CancellationToken ct = default);
    Task<AlternateMaterialApprovalDto> UpsertAlternateMaterialApprovalAsync(AlternateMaterialApprovalDto item, string actor, CancellationToken ct = default);
    Task<EngineeringChangeImpactAnalysisDto?> GetLatestEngineeringChangeImpactAsync(CancellationToken ct = default);
    Task<EngineeringChangeImpactAnalysisDto> UpsertEngineeringChangeImpactAsync(EngineeringChangeImpactAnalysisDto item, string actor, CancellationToken ct = default);
    Task<RouteCapabilityValidationDto?> GetLatestRouteCapabilityValidationAsync(CancellationToken ct = default);
    Task<RouteCapabilityValidationDto> UpsertRouteCapabilityValidationAsync(RouteCapabilityValidationDto item, string actor, CancellationToken ct = default);
    Task<ProductionAnomalyEventDto?> GetLatestProductionAnomalyEventAsync(CancellationToken ct = default);
    Task<ProductionAnomalyEventDto> UpsertProductionAnomalyEventAsync(ProductionAnomalyEventDto item, string actor, CancellationToken ct = default);
    Task<List<AnomalyDispatchRecordDto>> QueryAnomalyDispatchRecordsAsync(int take, CancellationToken ct = default);
    Task<AnomalyDispatchRecordDto> UpsertAnomalyDispatchRecordAsync(AnomalyDispatchRecordDto item, string actor, CancellationToken ct = default);
    Task<List<MonitoringSituationEscalationDto>> QueryMonitoringSituationEscalationsAsync(int take, CancellationToken ct = default);
    Task<MonitoringSituationEscalationDto> UpsertMonitoringSituationEscalationAsync(MonitoringSituationEscalationDto item, string actor, CancellationToken ct = default);
    Task<RiskSlaReviewRecordDto?> GetLatestRiskSlaReviewAsync(CancellationToken ct = default);
    Task<RiskSlaReviewRecordDto> UpsertRiskSlaReviewAsync(RiskSlaReviewRecordDto item, string actor, CancellationToken ct = default);
    Task<List<RiskActionTraceDto>> QueryRiskActionTracesAsync(int take, CancellationToken ct = default);
    Task<RiskActionTraceDto> UpsertRiskActionTraceAsync(RiskActionTraceDto item, string actor, CancellationToken ct = default);
    Task<List<AssistantActionAuditRecordDto>> QueryAssistantActionAuditsAsync(int take, CancellationToken ct = default);
    Task<AssistantActionAuditRecordDto> UpsertAssistantActionAuditAsync(AssistantActionAuditRecordDto item, string actor, CancellationToken ct = default);
    Task<List<AssistantRecoveryPackageDto>> QueryAssistantRecoveryPackagesAsync(int take, CancellationToken ct = default);
    Task<AssistantRecoveryPackageDto> UpsertAssistantRecoveryPackageAsync(AssistantRecoveryPackageDto item, string actor, CancellationToken ct = default);
    Task<List<AssistantAnomalyDispositionPackageDto>> QueryAssistantAnomalyPackagesAsync(int take, CancellationToken ct = default);
    Task<AssistantAnomalyDispositionPackageDto> UpsertAssistantAnomalyPackageAsync(AssistantAnomalyDispositionPackageDto item, string actor, CancellationToken ct = default);
    Task<List<AssistantEngineeringConstraintPackageDto>> QueryAssistantEngineeringConstraintPackagesAsync(int take, CancellationToken ct = default);
    Task<AssistantEngineeringConstraintPackageDto> UpsertAssistantEngineeringConstraintPackageAsync(AssistantEngineeringConstraintPackageDto item, string actor, CancellationToken ct = default);
    Task<CustomerOrderImportEvidenceDto?> GetLatestCustomerOrderImportAsync(CancellationToken ct = default);
    Task<CustomerOrderImportEvidenceDto> UpsertCustomerOrderImportAsync(CustomerOrderImportEvidenceDto item, string actor, CancellationToken ct = default);
    Task<PocReviewSignoffRecordDto?> GetLatestPocReviewSignoffAsync(CancellationToken ct = default);
    Task<PocReviewSignoffRecordDto> UpsertPocReviewSignoffAsync(PocReviewSignoffRecordDto item, string actor, CancellationToken ct = default);
    Task<PocRolloutPackageDto?> GetLatestPocRolloutPackageAsync(CancellationToken ct = default);
    Task<PocRolloutPackageDto> UpsertPocRolloutPackageAsync(PocRolloutPackageDto item, string actor, CancellationToken ct = default);
    Task<PocPilotRunRecordDto?> GetLatestPocPilotRunAsync(CancellationToken ct = default);
    Task<PocPilotRunRecordDto> UpsertPocPilotRunAsync(PocPilotRunRecordDto item, string actor, CancellationToken ct = default);
    Task<PocHypercareAcceptanceDto?> GetLatestPocHypercareAcceptanceAsync(CancellationToken ct = default);
    Task<PocHypercareAcceptanceDto> UpsertPocHypercareAcceptanceAsync(PocHypercareAcceptanceDto item, string actor, CancellationToken ct = default);
    Task<List<KnowledgeGovernanceReviewRecordDto>> QueryKnowledgeGovernanceReviewsAsync(int take, CancellationToken ct = default);
    Task<KnowledgeGovernanceReviewRecordDto> UpsertKnowledgeGovernanceReviewAsync(KnowledgeGovernanceReviewRecordDto item, string actor, CancellationToken ct = default);
    Task<List<LaborReassignmentRecordDto>> QueryLaborReassignmentsAsync(int take, CancellationToken ct = default);
    Task<LaborReassignmentRecordDto> UpsertLaborReassignmentAsync(LaborReassignmentRecordDto item, string actor, CancellationToken ct = default);
    Task<List<LaborQualificationBlockRecordDto>> QueryLaborQualificationBlocksAsync(int take, CancellationToken ct = default);
    Task<LaborQualificationBlockRecordDto> UpsertLaborQualificationBlockAsync(LaborQualificationBlockRecordDto item, string actor, CancellationToken ct = default);
    Task<List<BarcodeScanEvidenceRecordDto>> QueryBarcodeScanEvidenceAsync(int take, CancellationToken ct = default);
    Task<BarcodeScanEvidenceRecordDto> UpsertBarcodeScanEvidenceAsync(BarcodeScanEvidenceRecordDto item, string actor, CancellationToken ct = default);
    Task<QualityCapaClosureDto?> GetLatestQualityCapaClosureAsync(CancellationToken ct = default);
    Task<QualityCapaClosureDto> UpsertQualityCapaClosureAsync(QualityCapaClosureDto item, string actor, CancellationToken ct = default);
    Task<List<AgentConfigApprovalRecordDto>> QueryAgentConfigApprovalsAsync(int take, CancellationToken ct = default);
    Task<AgentConfigApprovalRecordDto> UpsertAgentConfigApprovalAsync(AgentConfigApprovalRecordDto item, string actor, CancellationToken ct = default);
    Task<List<OtdKpiCommitmentPackageDto>> QueryOtdKpiCommitmentsAsync(int take, CancellationToken ct = default);
    Task<OtdKpiCommitmentPackageDto?> GetLatestOtdKpiCommitmentAsync(CancellationToken ct = default);
    Task<OtdKpiCommitmentPackageDto> UpsertOtdKpiCommitmentAsync(OtdKpiCommitmentPackageDto item, string actor, CancellationToken ct = default);
    Task<List<QualityKnowledgeEvidenceRecordDto>> QueryQualityKnowledgeEvidenceAsync(string? evidenceType, int take, CancellationToken ct = default);
    Task<QualityKnowledgeEvidenceRecordDto> UpsertQualityKnowledgeEvidenceAsync(QualityKnowledgeEvidenceRecordDto item, string actor, CancellationToken ct = default);
}
