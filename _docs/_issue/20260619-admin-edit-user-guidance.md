# Issue — Edit User Dialog Lacked Local Governance Guidance

## Problem
The create-user modal had bilingual guidance and a help link, but the edit-user modal did not. Editing a user can change access scope and therefore needs the same local prompt before saving.

## Impact
Administrators could change roles without an in-context reminder to confirm access impact, owner, rollback path, and audit expectations.

## Resolution
The edit-user modal now displays bilingual guidance and links to `#admin-governance-help` before the save action.

## Evidence
See `_docs/_changelog/20260619-admin-edit-user-guidance.md`.
