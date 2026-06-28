# 2026-06-15 Issue: BOM ECN approval release evidence gap

Problem:

- `BomBoard` had coverage for failed ECN approval persistence but no focused positive test proving a successful approval locks the decision and releases scheduling evidence.
- Without that evidence, a regression could leave approve/reject controls visible after approval or fail to expose the audit id used by AI scheduling.

Resolution:

- Added a focused unit test for the successful ECN approval path.
- The test asserts the approved decision class, decision label, approval audit id, scheduling bridge release text, and removal of pending decision buttons.

Status:

- Verified by focused, file-level, and focused coverage commands.
