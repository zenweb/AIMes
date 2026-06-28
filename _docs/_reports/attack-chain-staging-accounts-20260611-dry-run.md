# Attack Chain staging account preparation

- GeneratedAt: 2026-06-11T08:55:17.2583064+08:00
- Action: DRY_RUN
- PostgreSQL container: aimes-pg
- Database: mes
- Boundary: this script prepares optional staging accounts for human Attack Chain verification. It does not perform or sign the manual verification gate.

## Requested accounts

| Username | Role | Password source |
| --- | --- | --- |
| attack_chain_admin | Admin | generated, not written to report |
| attack_chain_operator | Operator | generated, not written to report |

## Database counts

- Before system_users count: 0
- After system_users count: 0

## Account rows

```text
 username | role | is_active | must_change_password 
----------+------+-----------+----------------------
(0 rows)

```

## Result

- Result: DRY_RUN
- Next: rerun with -Apply and explicit passwords stored outside the report.
