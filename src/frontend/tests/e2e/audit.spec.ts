import { test, expect } from '@playwright/test'

test.describe('Audit 审计决策回放', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aimes_token', 'mock-e2e-token')
      localStorage.setItem('aimes_user', JSON.stringify({ username: 'admin', displayName: '管理员', role: 'Admin' }))
    })
    await page.goto('audit-logs')
    await page.waitForSelector('.audit-board', { timeout: 20000 })
  })

  test('展示 AI 建议、人工采纳、重排动作和配置审批回放', async ({ page }) => {
    const panel = page.locator('.audit-replay-panel')
    await expect(panel).toBeVisible()
    await expect(panel.getByText('建议、采纳、重排动作与配置审批可回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    await expect(cards.filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' })).toBeVisible()
    await expect(cards.filter({ hasText: 'M-AL-6061 收货后释放冻结工序' })).toBeVisible()
    await expect(cards.filter({ hasText: '锁定期保护从 8 小时调整为 10 小时' })).toBeVisible()
    await expect(panel.getByText('配置审批中')).toBeVisible()
    await expect(panel.getByText('证据链覆盖')).toBeVisible()
  })

  test('回放急单插入决策链', async ({ page }) => {
    const panel = page.locator('.audit-replay-panel')
    await panel.locator('.decision-card').filter({ hasText: 'WO-RUSH-9001 急单插入重排建议' }).getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-SCH-20260520-001')).toBeVisible()
    await expect(detail.getByText(/风险队列收到 WO-RUSH-9001 客户插单事件/)).toBeVisible()
    await expect(detail.getByText(/调度员填写/)).toBeVisible()
    await expect(detail.getByText(/AI 建议、人工采纳、反馈原因已归档/)).toBeVisible()
  })

  test('回放客户 POC 证据导入与设备故障样例链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_customer_order_import', JSON.stringify({
        batchId: 'IMP-POC-WO-20260520-001',
        fileName: '客户真实工单导入样例_30单.csv',
        source: '客户 IT / ERP 导出样例',
        importedOrders: 30,
        highRiskOrders: 6,
        mappedFields: ['工单号', '产品', '交期', '工艺路线', '物料缺口', '设备约束'],
        preparedAt: '2026-05-20T09:30:00.000Z',
      }))
      localStorage.setItem('aimes_customer_equipment_fault_evidence', JSON.stringify({
        batchId: 'IMP-POC-EQ-FAULT-20260520-001',
        fileName: '客户真实设备故障样例_CNC-001.csv',
        source: '客户设备联网平台 / 点检历史导出',
        equipmentCode: 'CNC-001',
        faultSamples: 12,
        affectedOrders: 'WO-2026-0042 / WO-RUSH-9001 / WO-DEMO-1001',
        downtimeHours: 4,
        capturedSignals: ['主轴振动', '轴承温度', '停机时长', '维修工单', '影响工单'],
        preparedAt: '2026-05-20T09:35:00.000Z',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('POC 证据回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    await expect(cards.filter({ hasText: '客户工单导入样例治理' })).toBeVisible()
    await expect(cards.filter({ hasText: '客户设备故障样例治理' })).toBeVisible()

    await cards.filter({ hasText: '客户设备故障样例治理' }).getByRole('button', { name: '回放决策链' }).click()
    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('AUD-POC-EQ-001')).toBeVisible()
    await expect(detail.getByText(/客户设备联网平台/)).toBeVisible()
    await expect(detail.getByText(/同步进入 AI 排产事件队列/)).toBeVisible()
    await expect(detail.getByText(/客户设备故障样例、停机事件、排产影响和 POC 评分回写已归档/)).toBeVisible()
  })

  test('回放统一 OTD 复盘证据链', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_otd_evidence_chain', JSON.stringify([
        {
          id: 'purchase-receipt-PO-RUSH-20260519',
          stage: '采购回写',
          title: 'M-AL-6061 加急采购收货已释放缺料风险',
          summary: 'PO-RUSH-20260519 收货完成，WO-RUSH-9001 / WO-DEMO-1002 的齐套缺口清零。',
          object: 'WO-RUSH-9001 / WO-DEMO-1002',
          source: '采购协同 / 华东铝材快供',
          traceId: 'PO-RUSH-20260519',
          status: 'closed',
          statusLabel: '已收货',
          createdAt: '2026-05-20T10:05:00.000Z',
        },
        {
          id: 'production-completion-op-020',
          stage: '生产完工',
          title: 'WO-DEMO-1001 CNC 精加工 完工回写',
          summary: '10 件完工，工单进度更新为 100%，质检结果 Pass。',
          object: 'WO-DEMO-1001',
          source: '生产报工 / admin',
          traceId: 'TRACE-PROD-COMPLETE-OP-020',
          status: 'closed',
          statusLabel: 'OTD 达成',
          createdAt: '2026-05-20T10:20:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('OTD 证据回放')).toBeVisible()
    const cards = panel.locator('.decision-card')
    const productionCard = cards.filter({ hasText: '生产完工：WO-DEMO-1001 CNC 精加工 完工回写' })
    await expect(productionCard).toBeVisible()
    await expect(productionCard.getByText('TRACE-PROD-COMPLETE-OP-020')).toBeVisible()
    await productionCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-PROD-COMPLETE-OP-020', { exact: true })).toBeVisible()
    await expect(detail.getByText(/生产完工 阶段生成证据/)).toBeVisible()
    await expect(detail.getByText(/报表中心 CSV 与审计回放均可核对该记录/)).toBeVisible()
    await expect(detail.getByText(/OTD 复盘证据链已归档/)).toBeVisible()
  })

  test('回放关键配置审批通过链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
        {
          id: 'cfg-lock-window',
          status: 'approved',
          decidedBy: 'admin',
          decidedAt: '2026-05-20T10:45:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const approvalCard = panel.locator('.decision-card').filter({ hasText: '配置审批：锁定期保护从 8 小时调整为 10 小时' })
    await expect(approvalCard.getByText(/当前状态：已通过/)).toBeVisible()
    await approvalCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-CFG-20260520-002', { exact: true })).toBeVisible()
    await expect(detail.getByText(/admin 审批通过/)).toBeVisible()
    await expect(detail.getByText(/关键配置审批通过，变更已进入配置审计/)).toBeVisible()
  })

  test('回放质量推荐实验扩大门禁审批链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_agent_config_approvals', JSON.stringify([
        {
          id: 'cfg-quality-experiment-gate',
          status: 'approved',
          decidedBy: '质量主管 刘工',
          decidedAt: '2026-05-21T18:45:00.000Z',
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const approvalCard = panel.locator('.decision-card').filter({ hasText: '配置审批：质量推荐实验扩大门禁复验通过率从 100% 调整为 95%' })
    await expect(approvalCard.getByText(/当前状态：已通过/)).toBeVisible()
    await approvalCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-CFG-QA-EXPERIMENT-GATE-20260521-001', { exact: true })).toBeVisible()
    await expect(detail.getByText(/系统识别为影响质量推荐实验策略的关键配置/)).toBeVisible()
    await expect(detail.getByText(/门禁指标调整：推荐采纳率 100% -> 100% \/ 复验通过率 100% -> >=95% \/ 负样本误召回 0 次 -> 0 次/)).toBeVisible()
    await expect(detail.getByText(/R4\/R6\/R7 扩大灰度必须同时满足推荐采纳率 100%、复验通过率 >=95%、负样本误召回 0 次/)).toBeVisible()
    await expect(detail.getByText(/质量主管 刘工 审批通过/)).toBeVisible()
  })

  test('回放 R5 回滚后的 R6 R7 实验候选链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
          id: 'quality-recommendation-feedback-r5-rejected',
          rankingId: 'reuse-rank-published-torque-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'rejected',
          decisionLabel: '现场拒绝推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: 'R5 引入跨线样本后出现同名缺陷误召回，需回滚复核。',
          decidedAt: '2026-05-21T17:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-R5-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-RECOMMENDATION-REJECTED',
          effectScoreBefore: 96,
          effectScoreAfter: 91,
          effectTrendLabel: '96 -> 91 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R6',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R6',
          feedbackActions: ['记录跨线负样本误召回。'],
          feedbackMetrics: [
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r5',
          sourceReviewQueueId: 'recommendation-feedback-quality-recommendation-feedback-r5-rejected',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          trainingSetName: '跨线扭矩偏移探索实验样本集',
          status: 'gray_published',
          statusLabel: '已灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T16:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R5-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-APPROVED',
          positiveSampleCount: 38,
          negativeSampleCount: 6,
          featurePolicy: 'R5 探索跨线扭矩偏移样本，但需严格监控误召回。',
          changeSummary: ['R5 引入跨产线同名缺陷样本。'],
          validationGates: ['R5 灰度前需复核跨线负样本误召回。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T16:50:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R5-VALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-VALIDATION-PASSED',
          validationSummary: 'R5 灰度前校验通过，但标记跨线误召回观察项。',
          validationFindings: ['跨线负样本误召回 2 次。'],
          publishedAt: '2026-05-21T17:00:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          publishSummary: 'R5 已灰度发布到跨线扭矩偏移推荐实验。',
          recommendationScope: ['跨线 OP-20 扭矩偏移', '质量知识复用排序灰度'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r5-initial-rolled_back',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r5',
          trainingSetVersion: 'QK-TRAIN-20260521-R5',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '首次灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-PUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-PUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'rolled_back',
          decisionLabel: '回滚到 R2 正式版',
          statusClass: 'guarded',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T17:30:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-GRAY-ROLLED-BACK',
          reason: 'R5 跨线样本误召回超过阈值，先回滚到 R2 正式版。',
          approvalStatus: 'not_required',
          approvalLabel: '回滚无需扩大审批',
          rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
          reviewIssueId: 'R5-REVIEW-ISSUE-20260521-001',
          reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R5-REVIEW-ISSUE',
          reviewIssueStatus: 'open',
          reviewIssueLabel: '待复核',
          metricSnapshot: [
            { label: '推荐采纳率', value: '0%' },
            { label: '复验通过率', value: '82%' },
            { label: '负样本误召回', value: '2 次' },
          ],
          actions: ['R5 跨线推荐实验回滚。'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    const candidateMetric = panel.locator('.metric-chip').filter({ hasText: '质量实验候选' })
    await expect(candidateMetric.locator('strong')).toHaveText('2')
    await expect(candidateMetric.locator('span')).toHaveText('质量实验候选')
    const r6Card = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R6 补样待合并回放' })
    await expect(r6Card).toBeVisible()
    await expect(r6Card.getByText('AUD-KG-QA-RETRAINING-R6-NEGATIVE-COVERAGE-20260521-001')).toBeVisible()
    await r6Card.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R6-NEGATIVE-COVERAGE', { exact: true })).toBeVisible()
    await expect(detail.getByText(/负样本覆盖 6 \/ 8 条，覆盖率 75%，需补 2 条跨线负样本/)).toBeVisible()
    await expect(detail.getByText(/R5 回滚审计 AUD-KG-QA-RETRAINING-R5-GRAY-ROLLBACK-20260521-001/)).toBeVisible()
    await expect(detail.getByText(/实验回滚、负样本覆盖率、下一轮候选和影子验证策略已归档/)).toBeVisible()

    const r7Card = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R7 影子验证待排队回放' })
    await expect(r7Card).toBeVisible()
  })

  test('回放 POC 复盘会评分表签署链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_poc_review_signoff', JSON.stringify({
        id: 'poc-review-signoff-20260520',
        meetingId: 'POC-REVIEW-20260520-001',
        targetCustomer: '离散制造工厂：多品种小批量、插单频繁、设备瓶颈明显',
        totalScore: 100,
        passScore: 85,
        result: 'approved',
        signedBy: '项目经理 / 客户代表',
        signedAt: '2026-05-20T11:20:00.000Z',
        reviewers: ['客户厂长', 'MES 项目经理', '调度主管', '设备主管'],
        evidenceBatches: ['IMP-POC-WO-20260520-001', 'IMP-POC-EQ-FAULT-20260520-001'],
        auditId: 'AUD-POC-REVIEW-20260520',
        summary: 'POC 评分 100 / 100，客户工单导入与设备故障样例证据齐套，达到 85 分通过线。',
      }))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('POC 复盘签署')).toBeVisible()
    const signoffCard = panel.locator('.decision-card').filter({ hasText: 'POC 复盘会评分表签署' })
    await expect(signoffCard.getByText('AUD-POC-REVIEW-20260520')).toBeVisible()
    await signoffCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('AUD-POC-REVIEW-20260520', { exact: true })).toBeVisible()
    await expect(detail.getByText(/评分结果 100 \/ 100，通过线 85 分/)).toBeVisible()
    await expect(detail.getByText(/IMP-POC-WO-20260520-001/)).toBeVisible()
    await expect(detail.getByText(/POC 评分、证据批次、签署人和复盘结论已归档/)).toBeVisible()
  })

  test('回放知识治理复核与索引重建链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_knowledge_governance_reviews', JSON.stringify([
        {
          id: 'knowledge-governance-review-kg-equipment-cnc-maint',
          documentId: 'kg-equipment-cnc-maint',
          documentTitle: 'CNC-01 主轴维护手册',
          version: 'V1.1',
          reviewedVersion: 'V1.2',
          validUntil: '2026-12-31',
          reviewer: '设备主管 / 知识库管理员',
          reviewedAt: '2026-05-20T12:10:00.000Z',
          auditId: 'AUD-KG-REINDEX-20260520-001',
          traceId: 'TRACE-KG-CNC-MAINT-REINDEX',
          action: '复核有效期并重建 RAG 索引',
          status: 'approved',
          summary: 'CNC-01 主轴维护手册已由设备主管复核，升级为 V1.2 并完成分块索引，可作为设备停机影响问答的正式引用来源。',
          references: ['AI 生产助手', '设备维护', '风险预警', 'AI 排产'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('知识治理回放')).toBeVisible()
    const knowledgeCard = panel.locator('.decision-card').filter({ hasText: 'CNC-01 主轴维护手册 V1.1 -> V1.2 复核重建索引' })
    await expect(knowledgeCard).toBeVisible()
    await expect(knowledgeCard.getByText('证据：AUD-KG-REINDEX-20260520-001')).toBeVisible()
    await knowledgeCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-CNC-MAINT-REINDEX', { exact: true })).toBeVisible()
    await expect(detail.getByText(/复核有效期并重建 RAG 索引/)).toBeVisible()
    await expect(detail.getByText(/文档升级为 V1.2/)).toBeVisible()
    await expect(detail.getByText(/知识复核、版本升级、索引重建和引用范围已归档/)).toBeVisible()
  })

  test('回放质量推荐采纳与下一轮训练集链路', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([
        {
          id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
          rankingId: 'reuse-rank-published-torque',
          trainingSetVersion: 'QK-TRAIN-20260521-R2',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          decision: 'accepted',
          decisionLabel: '现场已采纳推荐',
          owner: '质量工程师 周工 / 装配班长 王工',
          reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
          decidedAt: '2026-05-21T13:10:00.000Z',
          auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
          effectScoreBefore: 89,
          effectScoreAfter: 93,
          effectTrendLabel: '89 -> 93 分',
          nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
          nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          feedbackActions: ['按独立扭矩 CAPA 执行复验。', '采纳结果回写为正样本。'],
          feedbackMetrics: [
            { label: '推荐采纳耗时', value: '18 分钟' },
            { label: '复验通过率', value: '100%' },
          ],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('质量推荐回放')).toBeVisible()
    const feedbackCard = panel.locator('.decision-card').filter({ hasText: 'WO-DEMO-1018 OP-20 QK-TRAIN-20260521-R2 推荐采纳回放' })
    await expect(feedbackCard).toBeVisible()
    await expect(feedbackCard.getByText('AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001')).toBeVisible()
    await feedbackCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED', { exact: true })).toBeVisible()
    await expect(detail.getByText(/QK-TRAIN-20260521-R2 已发布到质量知识复用排序和 AI 推荐链路/)).toBeVisible()
    await expect(detail.getByText(/效果趋势 89 -> 93 分/)).toBeVisible()
    await expect(detail.locator('ol li').filter({ hasText: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3' })).toBeVisible()
    await expect(detail.getByText(/质量推荐采纳、效果趋势、下一轮训练集候选已归档/)).toBeVisible()
  })

  test('回放 R3 重新灰度发布链路', async ({ page }) => {
    await page.evaluate(() => {
      const feedback = {
        id: 'quality-recommendation-feedback-wo-demo-1018-op-20',
        rankingId: 'reuse-rank-published-torque',
        trainingSetVersion: 'QK-TRAIN-20260521-R2',
        targetWorkOrderId: 'WO-DEMO-1018',
        operationCode: 'OP-20',
        decision: 'accepted',
        decisionLabel: '现场已采纳推荐',
        owner: '质量工程师 周工 / 装配班长 王工',
        reason: '复验发现 OP-20 扭矩工具校准、设备族和缺陷模式均命中独立 CAPA 样本。',
        decidedAt: '2026-05-21T13:10:00.000Z',
        auditId: 'AUD-KG-QA-RECOMMENDATION-FEEDBACK-20260521-001',
        traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-RECOMMENDATION-ADOPTED',
        effectScoreBefore: 89,
        effectScoreAfter: 93,
        effectTrendLabel: '89 -> 93 分',
        nextTrainingSetVersion: 'QK-TRAIN-20260521-R3',
        nextTrainingTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
        feedbackActions: ['按独立扭矩 CAPA 执行复验。'],
        feedbackMetrics: [
          { label: '推荐采纳耗时', value: '18 分钟' },
          { label: '复验通过率', value: '100%' },
        ],
      }
      localStorage.setItem('aimes_quality_knowledge_recommendation_feedback', JSON.stringify([feedback]))
      localStorage.setItem('aimes_quality_knowledge_retraining_versions', JSON.stringify([
        {
          id: 'quality-retraining-version-qk-train-20260521-r3',
          sourceReviewQueueId: `recommendation-feedback-${feedback.id}`,
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          candidateTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-NEXT-TRAINING-R3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          trainingSetName: '推荐采纳效果持续学习样本集',
          status: 'gray_published',
          statusLabel: '已重新灰度发布',
          approvedBy: '知识库管理员 / 质量主管 刘工',
          approvedAt: '2026-05-21T13:30:00.000Z',
          approvalAuditId: 'AUD-KG-QA-RETRAINING-R3-APPROVAL-20260521-001',
          approvalTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-APPROVED',
          positiveSampleCount: 24,
          negativeSampleCount: 4,
          featurePolicy: 'R3 合并推荐采纳效果、复验通过率、扭矩工具校准字段和 R2 负样本对照。',
          changeSummary: ['R2 现场采纳反馈作为正样本进入 QK-TRAIN-20260521-R3。'],
          validationGates: ['R3 灰度前 Top-3 召回命中独立扭矩 CAPA 样本。'],
          validationStatus: 'passed',
          validatedAt: '2026-05-21T15:20:00.000Z',
          validationAuditId: 'AUD-KG-QA-RETRAINING-R3-SCOPE-REVALIDATION-PASS-20260521-001',
          validationTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-SCOPE-REVALIDATION-PASSED',
          validationSummary: 'R3 调整灰度范围后重新通过灰度前校验。',
          validationFindings: [
            'Top-3 召回命中独立扭矩 CAPA 样本。',
            'R2 回滚期间补充的负样本未被误召回。',
          ],
          publishedAt: '2026-05-21T15:35:00.000Z',
          publishAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
          publishTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
          publishSummary: 'R3 在调整灰度范围并重新通过校验后，再次灰度发布到 OP-20 装配扭矩推荐链路。',
          recommendationScope: ['WO-DEMO-1018 OP-20 装配扭矩偏移', '同设备族装配扭矩偏移灰度', 'AI 生产助手引用链灰度'],
        },
      ]))
      localStorage.setItem('aimes_quality_knowledge_gray_release_decisions', JSON.stringify([
        {
          id: 'quality-gray-release-decision-qk-train-20260521-r3-republish-rolled_back',
          monitorId: 'quality-gray-release-monitor-quality-retraining-version-qk-train-20260521-r3',
          trainingSetVersion: 'QK-TRAIN-20260521-R3',
          targetWorkOrderId: 'WO-DEMO-1018',
          operationCode: 'OP-20',
          releaseCycleLabel: '重新灰度发布',
          releaseAuditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001',
          releaseTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED',
          releaseScopeLabel: 'OP-20 装配扭矩推荐链路',
          decision: 'rolled_back',
          decisionLabel: '回滚到 R2 正式版',
          statusClass: 'guarded',
          decidedBy: '质量主管 刘工 / 知识库管理员',
          decidedAt: '2026-05-21T15:55:00.000Z',
          auditId: 'AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001',
          traceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK',
          reason: '重新灰度发布后仍要求保守验证，二次回滚到 R2 正式版。',
          approvalStatus: 'not_required',
          approvalLabel: '回滚无需扩大审批',
          rollbackTargetVersion: 'QK-TRAIN-20260521-R2',
          reviewIssueId: 'R3-REPUBLISH-REVIEW-ISSUE-20260521-001',
          reviewIssueTraceId: 'TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-REPUBLISH-REVIEW-ISSUE',
          reviewIssueStatus: 'open',
          reviewIssueLabel: '待复核',
          metricSnapshot: [
            { label: '推荐采纳率', value: '100%' },
            { label: '复验通过率', value: '100%' },
            { label: '负样本误召回', value: '0 次' },
          ],
          actions: ['重新灰度发布周期从 active 推荐选择中排除 QK-TRAIN-20260521-R3。'],
        },
      ]))
    })
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('.audit-board', { timeout: 20000 })

    const panel = page.locator('.audit-replay-panel')
    await expect(panel.getByText('质量灰度发布').first()).toBeVisible()
    const republishCard = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 重新灰度发布回放' })
    await expect(republishCard).toBeVisible()
    await expect(republishCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001')).toBeVisible()
    await republishCard.getByRole('button', { name: '回放决策链' }).click()

    const detail = panel.locator('.replay-detail')
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISHED', { exact: true })).toBeVisible()
    await expect(detail.getByText(/完成重新灰度发布/)).toBeVisible()
    await expect(detail.getByText(/同设备族装配扭矩偏移灰度/)).toBeVisible()
    await expect(detail.getByText(/推荐采纳率 100% \/ 复验通过率 100% \/ 负样本误召回 0 次/)).toBeVisible()
    await expect(detail.getByText(/重新灰度发布审计、灰度范围、监控指标和回滚目标已归档/)).toBeVisible()

    const republishDecisionCard = panel.locator('.decision-card').filter({ hasText: 'QK-TRAIN-20260521-R3 回滚到 R2 正式版回放 · 重新灰度发布' })
    await expect(republishDecisionCard).toBeVisible()
    await expect(republishDecisionCard.getByText('AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-ROLLBACK-20260521-001').first()).toBeVisible()
    await republishDecisionCard.getByRole('button', { name: '回放决策链' }).click()
    await expect(detail.getByText('TRACE-KG-QA-WO-DEMO-1018-OP-20-R3-GRAY-REPUBLISH-ROLLED-BACK', { exact: true })).toBeVisible()
    await expect(detail.getByText(/重新灰度发布发布证据：AUD-KG-QA-RETRAINING-R3-GRAY-REPUBLISH-20260521-001/)).toBeVisible()
    await expect(detail.getByText(/R3-REPUBLISH-REVIEW-ISSUE-20260521-001 待复核问题单已打开/)).toBeVisible()
  })
})
