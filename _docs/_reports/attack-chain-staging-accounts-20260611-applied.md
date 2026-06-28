# Attack Chain staging account preparation

- GeneratedAt: 2026-06-11T08:55:33.7874330+08:00
- Action: APPLY
- PostgreSQL container: aimes-pg
- Database: mes
- Boundary: this script prepares optional staging accounts for human Attack Chain verification. It does not perform or sign the manual verification gate.

## Requested accounts

| Username | Role | Password source |
| --- | --- | --- |
| attack_chain_admin | Admin | provided by caller, not written to report |
| attack_chain_operator | Operator | provided by caller, not written to report |

## Database counts

- Before system_users count: 0
- After system_users count: 2

## Account rows

```text
       username        |   role   | is_active | must_change_password 
-----------------------+----------+-----------+----------------------
 attack_chain_admin    | Admin    | t         | t
 attack_chain_operator | Operator | t         | t
(2 rows)

```

## Command output

```text
INSERT 0 2
```

## Result

- Result: APPLIED
- Next: use the provided passwords from the caller context to run manual Attack Chain A/B/C verification, then rotate or remove these accounts.
