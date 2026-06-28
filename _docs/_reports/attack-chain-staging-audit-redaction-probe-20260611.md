# Attack Chain staging audit redaction probe

- GeneratedAt: 2026-06-11T09:08:15.2782513+08:00
- Scope: account-backed staging audit redaction probe for Attack Chain B human review.
- Boundary: this report is machine-collected support evidence. It does not replace the human verifier, VerifiedAt, per-chain evidence, or security signoff.
- Password handling: passwords are supplied by the caller and are not written to this report.

## Probe

- Authenticated as: attack_chain_admin
- Operation: POST /api/v1/admin/users
- Created username: attack_chain_audit_probe_20260611
- Existing probe user count before create: 1
- HTTP status: SKIPPED_EXISTING

## Audit verification

```text
select id, action, resource, new_values,
       (new_values like '%***REDACTED***%') as has_redacted,
       (new_values like '%<plain-password>%') as has_plain_password
from audit_logs
where resource='admin'
  and action='POST'
  and new_values like '%attack_chain_audit_probe_20260611%'
order by created_at desc
limit 1;
```

Observed result:

```text
                  id                  | action | resource |                                                                   new_values                                                                    | has_redacted | has_plain_password 
--------------------------------------+--------+----------+-------------------------------------------------------------------------------------------------------------------------------------------------+--------------+--------------------
 274b2c9d-1dbe-4123-9630-c90b100eac38 | POST   | admin    | [{"Username":"attack_chain_audit_probe_20260611","DisplayName":"Attack Chain Audit Probe","Password":"***REDACTED***","Role":"Operator"},{},{}] | t            | f
(1 row)

```

## Attack Chain mapping

- Attack Chain B support: admin-created initial password is redacted in audit payloads.
- Attack Chain B support: the exact plain password used for the probe was not found in audit_logs.new_values.

## Result

- Result: PREPARED_ONLY
- Remaining: human verifier must inspect and accept this evidence before Attack Chain B can be marked PASS.
