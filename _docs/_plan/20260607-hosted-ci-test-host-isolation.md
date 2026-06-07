# Plan: Hosted CI test host isolation

## Success criteria

- Hosted CI backend integration tests no longer call Redis, RabbitMQ, or PostgreSQL unless explicitly provisioned by the workflow.
- Auth endpoint tests pass in GitHub Actions.
- Anonymous health endpoint test passes in GitHub Actions.
- Hosted CI run reaches `conclusion=success`.

## Steps

1. Read hosted CI failure logs and identify concrete stack trace.
2. Apply a test-host-only isolation fix.
3. Run local targeted integration tests.
4. Run full local integration tests and format verification.
5. Push to GitHub and validate hosted CI.

## Current state

Steps 1-4 are complete. Step 5 is pending.

