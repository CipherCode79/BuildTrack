# Backend Design Notes

- `src/app.module.ts`: centralized wiring of modules and DB config for transparent bootstrap.
- `src/documents/documents.service.ts`: orchestration layer for extract/confirm pipeline and blocking checks.
- `src/work-orders/work-orders.service.ts`: enforces one-active-work-order rule and creation guardrails.
- `src/contractors/contractors.service.ts`: reconciles expired licenses and auto-cancels active work orders.
- `src/common/rule-engine.ts`: keeps core rule primitives reusable and easy to audit.
- `db/schema.sql`: explicit SQL schema for local setup and assessment reproducibility.
