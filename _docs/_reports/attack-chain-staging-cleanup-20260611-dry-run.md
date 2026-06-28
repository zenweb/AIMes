# Attack Chain staging account preparation

- GeneratedAt: 2026-06-11T10:27:48.2089682+08:00
- Action: DRY_RUN
- PostgreSQL container: aimes-pg
- Database: mes
- Boundary: this script prepares optional staging accounts for human Attack Chain verification. It does not perform or sign the manual verification gate.

## Requested accounts

| Username | Role | Password source |
| --- | --- | --- |
| attack_chain_admin | Admin | generated, not written to report |
| attack_chain_operator | Operator | generated, not written to report |
| attack_chain_audit_probe_20260611 | Operator | existing audit probe account; password not needed for cleanup |

## Database counts

- Before system_users count: 3
- After system_users count: 3

## Account rows

```text
             username              |   role   | is_active | must_change_password 
-----------------------------------+----------+-----------+----------------------
 attack_chain_admin                | Admin    | t         | f
 attack_chain_audit_probe_20260611 | Operator | t         | t
 attack_chain_operator             | Operator | t         | f
(3 rows)

```

## Result

- Result: DRY_RUN
- Target usernames: attack_chain_admin, attack_chain_operator, attack_chain_audit_probe_20260611
- Next: rerun with -Apply and explicit passwords stored outside the report, or with -Remove after human verification is complete.
