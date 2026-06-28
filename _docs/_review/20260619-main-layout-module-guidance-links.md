# Review: MainLayout module guidance links

Date: 2026-06-19

## Findings

No blocking findings in this slice.

## Checks

- The change is scoped to the global shell guidance surface in `MainLayout.vue` and `MainLayout.css`.
- The new scheduling guidance satisfies the current product principles:
  - English and Simplified Chinese guidance are both visible.
  - Related UI points are exposed as contextual links.
  - Complex operations have a clickable help/support affordance.
- The unit test encodes why this matters: operators should review scheduling constraints, audit replay, and delivery evidence before complex actions.
- Existing MainLayout behaviors remained covered: mobile menu state, dark-mode persistence, logout redirect, mobile navigation close, and active module context.
- Production-preview browser evidence confirms the rendered `/scheduling` module guidance and help section.

## Residual risk

Only the scheduling-specific guidance has bespoke copy in this slice. Other modules use the generic shell guidance and can be deepened later if their workflows need module-specific help text. The overall CC goal remains active; gray observation is still outside this slice.
