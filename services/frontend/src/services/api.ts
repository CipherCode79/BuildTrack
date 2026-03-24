import type { Building, Contractor, ExtractionResponse, WorkOrder } from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  async getContractors(): Promise<Contractor[]> {
    const response = await fetch(`${API_BASE}/contractors`);
    return parseJson<Contractor[]>(response);
  },

  async createContractor(payload: {
    name: string;
    licenseNumber: string;
    licenseExpiryDate: string;
    phone?: string;
  }) {
    const response = await fetch(`${API_BASE}/contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson<Contractor>(response);
  },

  async getBuildings(): Promise<Building[]> {
    const response = await fetch(`${API_BASE}/buildings`);
    return parseJson<Building[]>(response);
  },

  async createBuilding(payload: { address: string; permitNumber?: string; ownerName?: string }) {
    const response = await fetch(`${API_BASE}/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson<Building>(response);
  },

  async getWorkOrders(): Promise<WorkOrder[]> {
    const response = await fetch(`${API_BASE}/work-orders`);
    return parseJson<WorkOrder[]>(response);
  },

  async extractDocument(file: File): Promise<ExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/documents/extract`, {
      method: 'POST',
      body: formData,
    });
    return parseJson<ExtractionResponse>(response);
  },

  async confirmDocument(payload: {
    fileId: number;
    contractor?: Record<string, string | undefined>;
    building?: Record<string, string | undefined>;
    workOrder?: Record<string, string | undefined>;
  }) {
    const response = await fetch(`${API_BASE}/documents/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson<Record<string, unknown>>(response);
  },
};
