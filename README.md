# BuildTrack - AI-Assisted Permit Processing

BuildTrack is a full-stack assessment project for processing building permit documents and managing contractor, building, and work-order records.

Workflow is intentionally simple:

1. Frontend uploads a PDF/image to NestJS.
2. NestJS sends the file to FastAPI for extraction.
3. FastAPI uses OpenAI to parse entities and returns structured JSON.
4. FastAPI also does lightweight matching against NestJS data (via REST).
5. NestJS stores extraction metadata, applies business rules, and persists confirmed records in PostgreSQL.
6. Frontend displays review/issue states and lets users confirm.

## Monorepo Structure

- `services/ai-microservice` - FastAPI extraction and matching service
- `services/backend` - NestJS API and PostgreSQL integration
- `services/frontend` - React + Vite UI with Tailwind CSS

Each service includes a dedicated rationale file:

- `services/ai-microservice/WHY_FASTAPI.md`
- `services/backend/WHY_NESTJS.md`
- `services/frontend/WHY_REACT_VITE.md`

Each service also includes practical file-level design notes:

- `services/ai-microservice/DESIGN_NOTES.md`
- `services/backend/DESIGN_NOTES.md`
- `services/frontend/DESIGN_NOTES.md`

## 1) PostgreSQL Setup

```bash
psql -U postgres -f services/backend/db/create-db.sql
psql -U buildtrack -d buildtrack_db -f services/backend/db/schema.sql
```

## 2) Environment Variables

### FastAPI (`services/ai-microservice/.env`)

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
NEST_API_URL=http://localhost:3000
MAX_UPLOAD_MB=10
```

### NestJS (`services/backend/.env`)

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=buildtrack
DATABASE_PASSWORD=buildtrack_pass
DATABASE_NAME=buildtrack_db
AI_SERVICE_URL=http://localhost:8000
UPLOAD_DIR=./uploads
```

### Frontend (`services/frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 3) Run Services

### FastAPI

```bash
cd services/ai-microservice
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### NestJS

```bash
cd services/backend
npm install
npm run start:dev
```

### React Frontend

```bash
cd services/frontend
npm install
npm run dev
```

## 4) API Endpoints (NestJS)

- `GET /contractors`
- `POST /contractors`
- `PATCH /contractors/:id`
- `GET /buildings`
- `POST /buildings`
- `GET /work-orders`
- `POST /work-orders`
- `PATCH /work-orders/:id/status`
- `GET /files/:id`
- `POST /documents/extract`
- `POST /documents/confirm`

## 5) Business Rules Implemented

- Only one active work order per building.
- If contractor license is expired:
  - contractor is set inactive,
  - active work orders for that contractor are auto-cancelled,
  - new work order creation is blocked.

## 6) Notes About Provided PDFs

The provided PDFs are treated as test inputs only. The extraction service does not hardcode or pre-generate data from those files.

Suggested test samples:

- `SCENARIO_1_happy_path.pdf`
- `SCENARIO_2_sad_path_blocked.pdf`
- `WN_Technical_Assignment_BuildTrack.pdf`

## 7) File-Level Design Notes (Key Files)

### FastAPI
- `app/main.py`: request lifecycle and endpoints.
- `app/extractor.py`: AI prompt + parsing isolation.
- `app/matcher.py`: matching logic separated from extraction.

### NestJS
- `src/documents/documents.service.ts`: extract/confirm orchestration.
- `src/work-orders/work-orders.service.ts`: business rule gatekeeper.
- `src/common/rule-engine.ts`: centralized rule helpers.

### Frontend
- `src/pages/DocumentsWizardPage.tsx`: multi-step UX and blocking logic visibility.
- `src/services/api.ts`: centralized backend communication.
- `src/components/Layout.tsx`: consistent app shell.
