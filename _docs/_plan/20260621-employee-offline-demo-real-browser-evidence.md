# Plan: Employee Offline Demo Real Browser Evidence

## Goal
Make the Employee offline-demo entry regression repeatable with a real browser command.

## Steps
1. Reuse the existing Employee e2e suite instead of creating a separate browser framework.
2. Seed an explicit offline-demo Admin session.
3. Open `employee?offlineDemo=1`.
4. Assert local employee data, bilingual guidance, and contextual links are visible.
5. Assert employee load failure text, raw backend skip text, and alert role are absent.
6. Run the focused Playwright command and archive the evidence.

## Status
- Completed on 2026-06-21.

