import base64
import json
from typing import Any

import httpx
from openai import AsyncOpenAI


SYSTEM_PROMPT = """
You extract permit-related entities from uploaded files.
Classify the document into exactly one entity type:
- Contractor
- Building
- WorkOrder
- Mixed

Return strict JSON with shape:
{
  "entity_type": "Contractor|Building|WorkOrder|Mixed",
  "contractor": {
    "name": string|null,
    "license_number": string|null,
    "license_expiry_date": "YYYY-MM-DD"|null,
    "phone": string|null
  },
  "building": {
    "address": string|null,
    "permit_number": string|null,
    "owner_name": string|null
  },
  "work_order": {
    "description": string|null,
    "proposed_start_date": "YYYY-MM-DD"|null,
    "status": "active|cancelled|pending"|null
  },
  "confidence": number_between_0_and_1,
  "raw_summary": short_human_summary
}

Never include markdown. Output JSON only.
""".strip()


def _bytes_to_base64(payload: bytes) -> str:
    return base64.b64encode(payload).decode("utf-8")


def _build_responses_input(filename: str, content_type: str, b64: str) -> list[dict[str, Any]]:
    return [
        {
            "role": "system",
            "content": [{"type": "input_text", "text": SYSTEM_PROMPT}],
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": f"File name: {filename}; Content-Type: {content_type}",
                },
                {
                    "type": "input_file",
                    "filename": filename,
                    "file_data": f"data:{content_type};base64,{b64}",
                },
            ],
        },
    ]


def _extract_output_text(response_payload: dict[str, Any]) -> str:
    if isinstance(response_payload.get("output_text"), str) and response_payload["output_text"].strip():
        return response_payload["output_text"].strip()

    output = response_payload.get("output") or []
    for item in output:
        content_items = item.get("content") if isinstance(item, dict) else None
        if not isinstance(content_items, list):
            continue
        for content in content_items:
            text_value = content.get("text") if isinstance(content, dict) else None
            if isinstance(text_value, str) and text_value.strip():
                return text_value.strip()

    raise RuntimeError("OpenAI response did not include output text.")


async def extract_document(
    client: AsyncOpenAI,
    *,
    api_key: str,
    model: str,
    filename: str,
    content_type: str,
    data: bytes,
) -> dict[str, Any]:
    b64 = _bytes_to_base64(data)
    request_input = _build_responses_input(filename, content_type, b64)

    if hasattr(client, "responses"):
        response = await client.responses.create(
            model=model,
            input=request_input,
            temperature=0,
        )
        text = (response.output_text or "").strip()
        if not text:
            text = _extract_output_text(response.model_dump())
        return json.loads(text)


    async with httpx.AsyncClient(timeout=120.0) as http_client:
        response = await http_client.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "input": request_input,
                "temperature": 0,
            },
        )
        response.raise_for_status()

    text = _extract_output_text(response.json())
    return json.loads(text)
