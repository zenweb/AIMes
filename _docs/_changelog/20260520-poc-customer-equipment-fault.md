# 2026-05-20 POC 客户真实设备故障数据闭环

## 变更

- `报表中心` 的“客户真实设备故障数据”POC 缺口新增“准备设备故障样例”入口，跳转到 `设备维护`。
- `设备维护` 新增客户真实设备故障数据面板，可生成 `IMP-POC-EQ-FAULT-20260520-001` 演示批次。
- 故障批次映射主轴振动、轴承温度、停机时长、维修工单和影响工单，并同步 `CNC-001` 停机事件到 `AI 排产` 事件队列。
- `报表中心` 读取故障证据后，把事件闭环维度从 `24/25` 提升到 `25/25`，当前 POC 评分从 `97/100` 提升到 `98/100`。
- `报表中心` 将客户真实设备故障数据加入 POC 验收证据 checklist，单独补齐后显示 `设备维护 / 已导入`。

## 验证

- `npm run test:e2e -- tests/e2e/equipment.spec.ts tests/e2e/report.spec.ts -g "客户真实设备故障|客户真实设备故障数据"`：2 passed。
- `npm run test:e2e -- tests/e2e/report.spec.ts`：6 passed。
- `npm run test:e2e -- tests/e2e/equipment.spec.ts tests/e2e/report.spec.ts`：25 passed。
