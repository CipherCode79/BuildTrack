from typing import Any

import httpx


def _normalize(value: str | None) -> str:
    return (value or "").strip().lower()


async def get_backend_matches(base_url: str, extraction: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    contractor_payload = extraction.get("contractor") or {}
    building_payload = extraction.get("building") or {}

    contractor_key = _normalize(contractor_payload.get("license_number") or contractor_payload.get("name"))
    building_key = _normalize(building_payload.get("permit_number") or building_payload.get("address"))

    async with httpx.AsyncClient(timeout=10.0) as client:
        contractors_resp = await client.get(f"{base_url}/contractors")
        buildings_resp = await client.get(f"{base_url}/buildings")

    contractors_resp.raise_for_status()
    buildings_resp.raise_for_status()

    contractors = contractors_resp.json() if isinstance(contractors_resp.json(), list) else []
    buildings = buildings_resp.json() if isinstance(buildings_resp.json(), list) else []

    contractor_matches = []
    for item in contractors:
        license_number = _normalize(item.get("licenseNumber"))
        name = _normalize(item.get("name"))
        if contractor_key and contractor_key in {license_number, name}:
            contractor_matches.append(item)

    building_matches = []
    for item in buildings:
        permit_number = _normalize(item.get("permitNumber"))
        address = _normalize(item.get("address"))
        if building_key and building_key in {permit_number, address}:
            building_matches.append(item)

    return {
        "contractor_matches": contractor_matches,
        "building_matches": building_matches,
    }
