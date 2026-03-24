export type Contractor = {
  id: number;
  name: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  phone?: string;
  status: string;
  isActive: boolean;
};

export type Building = {
  id: number;
  address: string;
  permitNumber?: string;
  ownerName?: string;
};

export type WorkOrder = {
  id: number;
  status: string;
  description?: string;
  building: Building;
  contractor: Contractor;
};

export type ExtractionResponse = {
  fileId: number;
  extraction: {
    entity_type: string;
    contractor?: {
      name?: string;
      license_number?: string;
      license_expiry_date?: string;
      phone?: string;
    };
    building?: {
      address?: string;
      permit_number?: string;
      owner_name?: string;
    };
    work_order?: {
      description?: string;
      status?: string;
    };
    confidence: number;
    raw_summary?: string;
  };
  matches: {
    contractor_matches: Contractor[];
    building_matches: Building[];
  };
  blockingIssues: string[];
};
