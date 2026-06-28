# 2026-06-13 Review: Knowledge API contract evidence

## Review result

The knowledge API helper now has focused contract evidence for the chat and document-upload paths.

## Evidence covered

- `queryKnowledge` posts to `/knowledge/query` with the original request object.
- `getChatHistory` reads `/knowledge/chat-history/{sessionId}` with `maxMessages`.
- `uploadDocument` sends multipart form data with `file`, optional `category`, multipart headers, and a 120 second timeout.

## Boundary

This is an existing-feature evidence slice. It does not add knowledge features and does not claim gray observation completion.

