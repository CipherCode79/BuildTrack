from fastapi import FastAPI, File, HTTPException, UploadFile
from openai import AsyncOpenAI

from .config import settings
from .extractor import extract_document
from .matcher import get_backend_matches
from .schemas import ExtractResponse, ExtractionResult, MatchSummary

app = FastAPI(title="BuildTrack AI Microservice", version="1.0.0")
openai_client = AsyncOpenAI(api_key=settings.openai_api_key)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)) -> ExtractResponse:
    payload = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024

    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(payload) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_mb}MB limit")

    try:
        extracted = await extract_document(
            openai_client,
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            filename=file.filename or "document",
            content_type=file.content_type or "application/octet-stream",
            data=payload,
        )
        extraction = ExtractionResult.model_validate(extracted)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to extract document: {exc}") from exc

    try:
        match_payload = await get_backend_matches(settings.nest_api_url, extraction.model_dump())
        matches = MatchSummary(
            contractor_matches=match_payload["contractor_matches"],
            building_matches=match_payload["building_matches"],
        )
    except Exception:
        matches = MatchSummary()

    return ExtractResponse(extraction=extraction, matches=matches)
