# API host port 5002 issue note

## Issue

Some current operator-facing documents still instructed users to open or probe `http://localhost:5000`, even though the Docker Compose API host mapping had already moved to `5002:5000`. A follow-up README pass found the same stale host-port guidance in Docker Compose access URLs and `VITE_API_TARGET` setup text.

## Impact

- Users could continue trying the occupied or undesired host port `5000`.
- Troubleshooting steps could send people toward the wrong port.

## Resolution

- Updated current Quickstart, SOP, and Troubleshooting references to use host `5002`.
- Updated README Docker Compose entry URLs and host API target text to use host `5002`.
- Left historical evidence documents unchanged because they describe past runs.
