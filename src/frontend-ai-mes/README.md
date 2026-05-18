# AIMes AI MES React Prototype

This directory is a product and UI prototype for the next AIMes interface. It is intentionally separate from the current Vue frontend so the existing V1 demo remains runnable while the AI MES direction is designed and reviewed.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI style primitives
- Lucide React icons

## Product Scope

The prototype focuses on five upgrades requested for the AI MES direction:

1. Production command flow: order, BOM, routing, material readiness, capacity, schedule, dispatch, report, inspect, anomaly, reschedule.
2. AI scheduling center: strategy comparison, constraint explanation, conflict detection, insertion order handling, equipment failure recovery.
3. AI anomaly loop: detect, classify, infer root cause, suggest actions, assign owner, verify result, record adoption.
4. Real factory demo data: products, BOMs, routings, equipment, shifts, work orders, material shortages, quality drift, downtime.
5. Role workspaces: scheduler, supervisor, quality, maintenance, warehouse, purchasing, management.

## Run

```bash
npm install
npm run dev
```

The current implementation is a static product prototype. API integration should happen after the workflow and layout are accepted.
