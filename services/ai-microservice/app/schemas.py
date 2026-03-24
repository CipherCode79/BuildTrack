from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

EntityType = Literal["Contractor", "Building", "WorkOrder", "Mixed"]


class ContractorData(BaseModel):
    name: str | None = None
    license_number: str | None = None
    license_expiry_date: date | None = None
    phone: str | None = None


class BuildingData(BaseModel):
    address: str | None = None
    permit_number: str | None = None
    owner_name: str | None = None


class WorkOrderData(BaseModel):
    description: str | None = None
    proposed_start_date: date | None = None
    status: str | None = "active"


class ExtractionResult(BaseModel):
    entity_type: EntityType
    contractor: ContractorData | None = None
    building: BuildingData | None = None
    work_order: WorkOrderData | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    raw_summary: str | None = None


class MatchSummary(BaseModel):
    contractor_matches: list[dict[str, Any]] = Field(default_factory=list)
    building_matches: list[dict[str, Any]] = Field(default_factory=list)


class ExtractResponse(BaseModel):
    extraction: ExtractionResult
    matches: MatchSummary
