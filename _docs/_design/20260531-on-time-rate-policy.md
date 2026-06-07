# 2026-05-31 OnTimeRate 口径

## 定义

`Production.OnTimeRate` 表示已经到交付承诺窗口的工单中，按期完工的比例。

```text
OnTimeRate = 按期完工工单数 / 已完成或已到期工单数
```

## 分母

- 已完成工单：无论是否超期，都进入分母。
- 未完成但 `PlannedEndDate <= referenceTime` 的工单：进入分母，并按未准时计算。
- 未完成且尚未到 `PlannedEndDate` 的工单：不进入分母。
- 已取消工单目前仍按到期状态进入分母；如未来要排除取消单，需要先补业务规则与测试。

## 分子

- `Status == Completed`
- `ActualEndDate` 有值
- `ActualEndDate <= PlannedEndDate`

## 落点

- 计算器：`MES.Application.Services.ProductionKpiCalculator`
- API：`GET /api/v1/report/dashboard` 的 `production.onTimeRate`
- 测试：
  - `ProductionKpiCalculatorTests.CalculateOnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator`
  - `ReportControllerTests.GetDashboard_OnTimeRate_ShouldCountOverdueUnfinishedWorkOrdersInDenominator`
