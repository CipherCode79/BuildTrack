# Frontend Design Notes

- `src/pages/DocumentsWizardPage.tsx`: single source for multi-step flow, blocking issues, and confirmation UX.
- `src/services/api.ts`: all HTTP calls in one place so pages stay focused on rendering.
- `src/components/Layout.tsx`: shared app shell and navigation for consistent UI behavior.
- `src/pages/ContractorsPage.tsx`: simple registry management with immediate list refresh.
- `src/pages/BuildingsPage.tsx`: straightforward building CRUD flow matching backend model.
- `src/pages/WorkOrdersPage.tsx`: read-focused status visibility for rule validation demos.
