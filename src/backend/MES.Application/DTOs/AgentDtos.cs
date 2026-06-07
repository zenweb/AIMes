using System.Text.Json;

namespace MES.Application.DTOs;

public class AgentRecommendRequest
{
    public string WorkshopId { get; set; } = string.Empty;
    public string EventType { get; set; } = "ManualReview";
    public string SourceModule { get; set; } = "Scheduling";
    public string BusinessKeyType { get; set; } = "Workshop";
    public string BusinessKeyValue { get; set; } = string.Empty;
    public string Severity { get; set; } = "Info";
    public List<string>? WorkOrderIds { get; set; }
    public string? Objective { get; set; }
    public Dictionary<string, object>? Payload { get; set; }
}

public class AgentDecisionDto
{
    public string Id { get; set; } = string.Empty;
    public string TriggerEventId { get; set; } = string.Empty;
    public string BoundedContext { get; set; } = string.Empty;
    public string DecisionType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? RecommendedScenarioId { get; set; }
    public string? AdoptedScenarioId { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string AgentVersion { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public string PromptHash { get; set; } = string.Empty;
    public string ContextHash { get; set; } = string.Empty;
    public string? InputSummary { get; set; }
    public string? OutputSummary { get; set; }
    public string BusinessKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<AgentDecisionScenarioDto> Scenarios { get; set; } = new();
}

public class AgentDecisionScenarioDto
{
    public string Id { get; set; } = string.Empty;
    public string StrategyName { get; set; } = string.Empty;
    public string? PriorityRule { get; set; }
    public string? CapacityStrategy { get; set; }
    public string? Objective { get; set; }
    public double OtdProjection { get; set; }
    public double UtilizationProjection { get; set; }
    public double ChangeoverProjection { get; set; }
    public string? Explanation { get; set; }
    public string? SacrificedObjectives { get; set; }
}

public class AgentDecisionActionRequest
{
    public string ScenarioId { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public class AgentDecisionRejectRequest
{
    public string? Reason { get; set; }
}

/// <summary>
/// 跨域 Agent execute 类动作请求（质量处置/采购动作/维护动作通用 payload）。
/// 后端会按动作类型识别 payload 并执行受控业务写入，同时保留审计回放证据。
/// </summary>
public class AgentExecuteActionRequest
{
    /// <summary>动作摘要，例如 "isolate-batch"/"acknowledge-supply-arrival"/"create-maintenance-order"</summary>
    public string ActionName { get; set; } = string.Empty;

    /// <summary>动作原因/说明</summary>
    public string? Reason { get; set; }

    /// <summary>动作携带的业务上下文 payload（例如 batchId、supplierId、equipmentId 等）</summary>
    public Dictionary<string, object>? Payload { get; set; }
}

public record OtdEvidenceChainItemDto(
    string Id,
    string Stage,
    string Title,
    string Summary,
    string Object,
    string Source,
    string TraceId,
    string? SourceTraceId,
    string Status,
    string StatusLabel,
    DateTime CreatedAt);

public record EquipmentDowntimeEventDto(
    string EquipmentCode,
    string EquipmentName,
    decimal DowntimeHours,
    string AffectedOrders,
    string AlternativeEquipment,
    string MaintenanceWindow,
    string ProtectionStrategy,
    DateTime CreatedAt);

public record CustomerEquipmentFaultEvidenceDto(
    string BatchId,
    string FileName,
    string Source,
    string EquipmentCode,
    int FaultSamples,
    string AffectedOrders,
    decimal DowntimeHours,
    List<string> CapturedSignals,
    DateTime PreparedAt);

public record ShortageKittingEventDto(
    string MaterialCode,
    string MaterialName,
    string WorkOrderNumber,
    string AffectedOrders,
    decimal RequiredQuantity,
    decimal AvailableQuantity,
    decimal InboundQuantity,
    decimal ShortageQuantity,
    string Window,
    string Suggestion,
    DateTime CreatedAt);

public record ShortageRiskResolutionDto(
    string MaterialCode,
    string MaterialName,
    string AffectedOrders,
    string SourceOrderNumber,
    decimal ReceivedQuantity,
    string Unit,
    decimal AvailableQuantity,
    DateTime ResolvedAt,
    string Message);

public record BomKittingPackageItemDto(
    string MaterialCode,
    string MaterialName,
    decimal RequiredQuantity,
    decimal AvailableQuantity,
    decimal InboundQuantity,
    decimal ShortageQuantity,
    string Unit,
    string Action);

public record BomKittingPackageDto(
    string Id,
    string BomCode,
    string BomVersion,
    string ProductName,
    string WorkOrderNumber,
    string ScheduleWindow,
    string StatusLabel,
    string Owner,
    string AuditId,
    string TraceId,
    DateTime CreatedAt,
    string Summary,
    List<BomKittingPackageItemDto> Items);

public record SupplyRiskEscalationDto(
    string PurchaseOrderNumber,
    string MaterialCode,
    string MaterialName,
    string SupplierName,
    DateTime OriginalDeliveryDate,
    DateTime PromisedDeliveryDate,
    int DelayDays,
    string AffectedOrders,
    string AlternateSupplierName,
    string AlternatePromiseDate,
    string Decision,
    string StatusLabel,
    string AuditId,
    string TraceId,
    string Message,
    DateTime CreatedAt,
    DateTime? ReceivedAt,
    decimal? ReceivedQuantity,
    string? ReceiptAuditId,
    string? ReceiptTraceId,
    string? ReceiptMessage);

public record SupplierNetworkCandidateDto(
    string SupplierName,
    string PromiseDate,
    decimal QuotedPrice,
    decimal CapacityQuantity,
    decimal OnTimeRate,
    decimal DefectRate,
    decimal PerformanceScore,
    int SlaLeadTimeHours,
    string SlaStatus,
    string RiskNote);

public record SupplierNetworkDecisionDto(
    string MaterialCode,
    string MaterialName,
    string AffectedOrders,
    string SelectedSupplierName,
    string SelectedPromiseDate,
    decimal SelectedPerformanceScore,
    decimal SelectedOnTimeRate,
    decimal SelectedQuotedPrice,
    decimal SelectedCapacityQuantity,
    List<SupplierNetworkCandidateDto> Candidates,
    string StatusLabel,
    string AuditId,
    string TraceId,
    string Message,
    DateTime CreatedAt);

public record OutsourcingCommitmentActionDto(
    string Module,
    string Owner,
    string Action,
    string Evidence);

public record OutsourcingCommitmentPackageDto(
    string Id,
    string SourceKpiId,
    string DimensionLabel,
    string TargetName,
    string Title,
    string AuditId,
    string TraceId,
    string Actor,
    decimal BaselineOtd,
    decimal AgentOtd,
    decimal Lift,
    int DelayedReduced,
    string StatusLabel,
    string Commitment,
    string Owner,
    string DueAt,
    string Summary,
    List<OutsourcingCommitmentActionDto> Actions,
    string PartnerName,
    string PromiseDate,
    string AffectedOrders,
    string SourceTraceId,
    DateTime CreatedAt,
    DateTime? ReceivedAt,
    string? ReceivedBy,
    string? ReceiptAuditId,
    string? ReceiptTraceId,
    string? ReceiptMessage,
    DateTime? ScheduleReleasedAt,
    string? ScheduleReleasedBy,
    string? ScheduleReleaseAuditId,
    string? ScheduleReleaseTraceId,
    string? ScheduleReleaseMessage);

public record QualityReworkImpactDto(
    string InspectionId,
    string WorkOrderId,
    string ProductCode,
    string ProcessName,
    string EquipmentCode,
    string MaterialBatchCode,
    string BatchCode,
    string InspectionPoint,
    int DefectQuantity,
    decimal ReworkHours,
    string OtdImpact,
    string RecommendedAction,
    string RootCause,
    List<string> Evidence,
    DateTime CreatedAt);

public record QualityMrbDispositionActionDto(
    string Module,
    string Owner,
    string Action,
    string DueAt,
    string Evidence,
    string? Result);

public record QualityMrbDispositionRecordDto(
    string Id,
    string Title,
    string InspectionId,
    string WorkOrderId,
    string ProductCode,
    string ProcessName,
    string EquipmentCode,
    string MaterialBatchCode,
    string BatchCode,
    string InspectionPoint,
    string DefectPattern,
    int DefectQuantity,
    string Disposition,
    string DispositionLabel,
    string Status,
    string StatusLabel,
    string Owner,
    string DueAt,
    string OtdImpact,
    string ScheduleImpact,
    string RecommendedAction,
    string AuditId,
    string TraceId,
    string ScheduleTraceId,
    DateTime CreatedAt,
    List<QualityMrbDispositionActionDto> Actions,
    string? ClosureAuditId,
    string? ClosureTraceId,
    string? ClosureSummary,
    DateTime? ClosedAt,
    string? ClosedBy);

public record AlternateMaterialApprovalDto(
    string Id,
    string BomCode,
    string BomVersion,
    string SourceMaterialCode,
    string AlternateMaterialCode,
    string AlternateMaterialName,
    string AffectedOrders,
    string ApprovedBy,
    DateTime ApprovedAt,
    string AuditId,
    string TraceId,
    string Status,
    string Summary);

public record RouteCapabilityValidationDto(
    string Id,
    string RouteCode,
    string RouteVersion,
    string RouteName,
    string OperationCode,
    string OperationName,
    string BottleneckResource,
    string CandidateEquipment,
    string AffectedOrders,
    decimal CapacityGapHours,
    decimal ChangeoverMinutes,
    string BatchWindow,
    string Decision,
    string ValidatedBy,
    DateTime ValidatedAt,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    string AuditId,
    string TraceId,
    string StatusLabel,
    string Summary);

public record EngineeringChangeImpactAnalysisDto(
    string Id,
    string ChangeId,
    string BomCode,
    string BomVersion,
    string ChangeTitle,
    string SourceMaterialCode,
    string AlternateMaterialCode,
    string AlternateMaterialName,
    string AffectedOrders,
    string InventoryImpact,
    string QualityImpact,
    string SupplierImpact,
    string CostImpact,
    string OtdImpact,
    string ScheduleWindow,
    string RecommendedDecision,
    string AnalyzedBy,
    DateTime AnalyzedAt,
    string AuditId,
    string TraceId,
    string Decision,
    string DecisionLabel,
    string? DecidedBy,
    DateTime? DecidedAt,
    string? DecisionReason,
    string? DecisionAuditId,
    string StatusLabel,
    string Summary);

public record ProductionAnomalyEventDto(
    string Id,
    string WorkOrderNumber,
    string OperationCode,
    string OperationName,
    string? EquipmentId,
    string AnomalyType,
    string Severity,
    string Title,
    string Description,
    string DetectedAt,
    string DetectedBy,
    string SuggestedAction);

public record AnomalyDispatchRecordDto(
    string Id,
    string AnomalyId,
    string Type,
    string TypeLabel,
    string Title,
    string WorkOrderNumber,
    string OperationCode,
    string Route,
    string Owner,
    string DueAt,
    string AffectedOrders,
    string DeliveryImpact,
    string ScheduleWindow,
    string SuggestedAction,
    string AuditId,
    string TraceId,
    string Status,
    string StatusLabel,
    string CreatedAt,
    string Summary);

public record MonitoringSituationEscalationDto(
    string Id,
    string SourceEventId,
    string Title,
    string Source,
    string WorkOrders,
    string Priority,
    string Owner,
    string DueAt,
    string AuditId,
    string TraceId,
    string Status,
    string StatusLabel,
    string ScheduleWindow,
    string ScheduleAction,
    string RiskImpact,
    string RiskSuggestion,
    string OtdImpact,
    string DelayImpact,
    string ChangeoverImpact,
    string Summary,
    List<string> Evidence,
    List<string> DispatchSteps,
    string CreatedAt,
    string? ClosedAt,
    string? ClosureTrace);

public record RiskSlaReviewRiskDto(
    string Id,
    string Type,
    string Title,
    string Owner,
    string DueAt,
    string WorkOrders,
    string DeliveryImpact,
    string StatusLabel,
    string SlaStatus,
    string RequiredAction);

public record RiskSlaReviewActionDto(
    string Module,
    string Owner,
    string DueAt,
    string Action,
    string Evidence,
    string? Result);

public record RiskSlaReviewRecordDto(
    string Id,
    string Title,
    string Status,
    string StatusLabel,
    string ReviewMeetingId,
    string Owner,
    int OverdueCount,
    int CriticalCount,
    string AffectedOrders,
    string OtdImpact,
    string AuditId,
    string TraceId,
    string CreatedAt,
    string Summary,
    List<RiskSlaReviewRiskDto> Risks,
    List<RiskSlaReviewActionDto> Actions,
    string? ClosedAt,
    string? ClosureAuditId,
    string? ClosureTraceId,
    string? ClosureSummary);

public record RiskActionTraceDto(
    string Id,
    string Title,
    string Type,
    string Status,
    string StatusLabel,
    string Owner,
    string WorkOrders,
    string DeliveryImpact,
    string Suggestion,
    string Trace,
    string CreatedAt);

public record AssistantActionAuditRecordDto(
    string Id,
    string ActionId,
    string Label,
    string Type,
    string Actor,
    string Role,
    string? TargetRoute,
    string AuditCode,
    string? TraceId,
    string ResultMessage,
    bool Permitted,
    string CreatedAt);

public record AssistantPackageStepDto(
    string Module,
    string Owner,
    string Action,
    string Evidence,
    string? Status,
    string? Result,
    string? ClosedAt);

public record AssistantRecoveryPackageDto(
    string Id,
    string Title,
    string AuditCode,
    string TraceId,
    string Actor,
    string Role,
    string WorkOrders,
    string Priority,
    string Owner,
    string DueAt,
    string ScheduleWindow,
    string ScheduleAction,
    string RiskImpact,
    string RiskSuggestion,
    string OtdImpact,
    string DelayImpact,
    string ChangeoverImpact,
    string? Status,
    string StatusLabel,
    string? PurchaseActionStatus,
    string? PurchaseActionAuditCode,
    string? PurchaseActionTraceId,
    string? PurchaseActionSummary,
    string? PurchaseActionClosedAt,
    string? PurchaseActionClosedBy,
    string? PurchaseOrderNumber,
    string? QualityActionStatus,
    string? QualityActionAuditCode,
    string? QualityActionTraceId,
    string? QualityActionSummary,
    string? QualityActionClosedAt,
    string? QualityActionClosedBy,
    string? FirstArticleRecord,
    string? ClosureAuditCode,
    string? ClosureTraceId,
    string? ClosureSummary,
    string? ClosedAt,
    string? ClosedBy,
    string Summary,
    List<AssistantPackageStepDto> DispatchSteps,
    string CreatedAt);

public record AssistantAnomalyDispositionPackageDto(
    string Id,
    string Title,
    string AuditCode,
    string TraceId,
    string Actor,
    string Role,
    string WorkOrders,
    string Priority,
    string Owner,
    string DueAt,
    string AnomalyTitle,
    string OperationCode,
    string EquipmentId,
    string DeliveryImpact,
    string ScheduleWindow,
    string StatusLabel,
    string Summary,
    List<AssistantPackageStepDto> DispatchSteps,
    string CreatedAt);

public record AssistantEngineeringConstraintPackageDto(
    string Id,
    string Title,
    string AuditCode,
    string TraceId,
    string Actor,
    string Role,
    string WorkOrders,
    string Priority,
    string Owner,
    string DueAt,
    string BomCode,
    string EcnCode,
    string RouteCode,
    string OperationCode,
    string OtdImpact,
    string StatusLabel,
    string Summary,
    List<AssistantPackageStepDto> DispatchSteps,
    string CreatedAt);

public record CustomerOrderImportEvidenceDto(
    string BatchId,
    string FileName,
    string Source,
    int ImportedOrders,
    int HighRiskOrders,
    List<string> MappedFields,
    DateTime PreparedAt);

public record PocReviewSignoffRecordDto(
    string Id,
    string MeetingId,
    string TargetCustomer,
    int TotalScore,
    int PassScore,
    string Result,
    string SignedBy,
    DateTime SignedAt,
    List<string> Reviewers,
    List<string> EvidenceBatches,
    string AuditId,
    string Summary);

public record PocRolloutActionDto(
    string Module,
    string Owner,
    string Action,
    string DueAt,
    string Evidence);

public record PocRolloutPackageDto(
    string Id,
    string Title,
    string TargetCustomer,
    string SourceMeetingId,
    string SourceAuditId,
    string Status,
    string StatusLabel,
    string RolloutWindow,
    string GoLiveGate,
    string Owner,
    List<string> SuccessCriteria,
    List<PocRolloutActionDto> Actions,
    string AuditId,
    string TraceId,
    DateTime CreatedAt,
    string Summary);

public record PocPilotRunWorkOrderDto(
    string WorkOrderNumber,
    string ProductName,
    int Quantity,
    string Route,
    string ScheduleDecision,
    string ExecutionStatus);

public record PocPilotRunCheckpointDto(
    string Module,
    string Owner,
    string Status,
    string Evidence,
    string Summary);

public record PocPilotRunRecordDto(
    string Id,
    string Title,
    string TargetCustomer,
    string SourcePackageId,
    string SourceAuditId,
    string Status,
    string StatusLabel,
    string RunWindow,
    string BatchId,
    int SampleSize,
    string OtdTarget,
    string ActualOtd,
    string Owner,
    List<PocPilotRunWorkOrderDto> WorkOrders,
    List<PocPilotRunCheckpointDto> Checkpoints,
    List<string> AcceptanceCriteria,
    string AuditId,
    string TraceId,
    DateTime CreatedAt,
    string Summary);

public record PocHypercareMonitorDto(
    string Label,
    string Target,
    string Current,
    string Status,
    string StatusLabel,
    string Evidence);

public record PocHypercareCheckpointDto(
    string Module,
    string Owner,
    string Action,
    string Status,
    string Evidence,
    string Summary);

public record PocHypercareAcceptanceDto(
    string Id,
    string Title,
    string TargetCustomer,
    string SourcePilotRunId,
    string SourcePilotAuditId,
    string Status,
    string StatusLabel,
    string GoLiveWindow,
    int HypercareDays,
    string OtdTarget,
    string ActualOtd,
    string OeeTarget,
    string CurrentOee,
    int IncidentCount,
    int UnresolvedP1P2,
    string AcceptanceGate,
    string Owner,
    List<PocHypercareMonitorDto> Monitors,
    List<PocHypercareCheckpointDto> Checkpoints,
    string AuditId,
    string TraceId,
    DateTime CreatedAt,
    string Summary);

public record KnowledgeGovernanceReviewRecordDto(
    string Id,
    string DocumentId,
    string DocumentTitle,
    string Version,
    string ReviewedVersion,
    string ValidUntil,
    string Reviewer,
    DateTime ReviewedAt,
    string AuditId,
    string TraceId,
    string Action,
    string Status,
    string Summary,
    List<string> References);

public record LaborReassignmentRecordDto(
    string Id,
    string WorkOrderNumber,
    string OperationCode,
    List<string> OperationCodes,
    string OperationName,
    string BlockedEmployeeNumber,
    string BlockedEmployeeName,
    string BlockedCertification,
    string BlockedExpiresAt,
    string ReplacementEmployeeNumber,
    string ReplacementEmployeeName,
    string ReplacementTeam,
    string ReplacementShift,
    string ReplacementSkill,
    string ReplacementCertification,
    string ReplacementExpiresAt,
    string ReviewerEmployeeNumber,
    string ReviewerName,
    string ReviewerRole,
    string Reason,
    string AuditId,
    string TraceId,
    string CreatedAt,
    string Status);

public record LaborQualificationBlockRecordDto(
    string Id,
    string WorkOrderNumber,
    string OperationCode,
    List<string> OperationCodes,
    string OperationName,
    string BlockedEmployeeNumber,
    string BlockedEmployeeName,
    string BlockedCertification,
    string BlockedExpiresAt,
    string RequiredSkill,
    string RequiredTeam,
    string RequiredShift,
    string ReviewerEmployeeNumber,
    string ReviewerName,
    string ReviewerRole,
    string Reason,
    string AuditId,
    string TraceId,
    string CreatedAt,
    string Status,
    string? ReviewedAt,
    string? ReleasedAt,
    string? ReleaseAuditId,
    string? ReleaseTraceId,
    string? ReleaseReason);

public record BarcodeScanEvidenceRecordDto(
    string Id,
    string Code,
    string Type,
    string Title,
    string Action,
    string Actor,
    string Object,
    string Source,
    string Summary,
    string TraceId,
    string StatusLabel,
    string CreatedAt,
    string NextCheck);

public record QualityCapaClosureDto(
    string InspectionId,
    string WorkOrderId,
    string TraceId,
    string RootCause,
    decimal EvidenceStrength,
    string TaskTitle,
    string TaskKind,
    string Owner,
    string DueAt,
    string Verification,
    string VerifiedAt,
    string AuditState,
    string OtdImpact,
    string ReviewAction);

public record AgentConfigApprovalMetricDto(
    string Label,
    string FromValue,
    string ToValue);

public record AgentConfigApprovalRecordDto(
    string Id,
    string Title,
    string ReplayTitle,
    string ConfigKey,
    string FromValue,
    string ToValue,
    string Reason,
    string Owner,
    string Status,
    string AuditId,
    string SubmittedBy,
    string SubmittedAt,
    string Risk,
    string? DecidedBy,
    string? DecidedAt,
    string? PolicyArea,
    List<AgentConfigApprovalMetricDto>? PolicyMetrics,
    string? ControlSummary);

public record OtdKpiCommitmentActionDto(
    string Module,
    string Owner,
    string Action,
    string Evidence);

public record OtdKpiCommitmentPackageDto(
    string Id,
    string SourceKpiId,
    string DimensionLabel,
    string TargetName,
    string Title,
    string AuditId,
    string TraceId,
    string Actor,
    decimal BaselineOtd,
    decimal AgentOtd,
    decimal Lift,
    int DelayedReduced,
    string StatusLabel,
    string Commitment,
    string Owner,
    string DueAt,
    string Summary,
    List<OtdKpiCommitmentActionDto> Actions,
    DateTime CreatedAt);

public record QualityKnowledgeEvidenceRecordDto(
    string Id,
    string EvidenceType,
    string Title,
    string AuditId,
    string TraceId,
    string Status,
    DateTime CreatedAt,
    JsonElement Payload);
