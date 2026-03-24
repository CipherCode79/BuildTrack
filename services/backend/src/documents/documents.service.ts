import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as FormData from 'form-data';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Building } from '../buildings/building.entity';
import { BuildingsService } from '../buildings/buildings.service';
import { Contractor } from '../contractors/contractor.entity';
import { ContractorsService } from '../contractors/contractors.service';
import { FileRecord } from '../files/file.entity';
import { FilesService } from '../files/files.service';
import { WorkOrder } from '../work-orders/work-order.entity';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { ConfirmDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly config: ConfigService,
    private readonly filesService: FilesService,
    private readonly contractorsService: ContractorsService,
    private readonly buildingsService: BuildingsService,
    private readonly workOrdersService: WorkOrdersService,
    @InjectRepository(Contractor) private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(Building) private readonly buildingRepo: Repository<Building>,
    @InjectRepository(WorkOrder) private readonly workOrderRepo: Repository<WorkOrder>,
  ) {}

  async extract(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file received');
    }

    const uploadDir = this.config.get<string>('UPLOAD_DIR', './uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const diskPath = join(uploadDir, `${Date.now()}-${file.originalname}`);
    await fs.writeFile(diskPath, file.buffer);

    const record = await this.filesService.create({
      filename: file.originalname,
      mimeType: file.mimetype,
      diskPath,
      extractionStatus: 'pending',
    });

    const formData = new FormData();
    formData.append('file', file.buffer, {
      contentType: file.mimetype,
      filename: file.originalname,
    });

    const aiServiceUrl = this.config.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
    let response;
    try {
      response = await axios.post(`${aiServiceUrl}/extract`, formData, {
        headers: formData.getHeaders(),
        timeout: 120000,
      });
    } catch (error: any) {
      const reason =
        error?.response?.data?.detail ||
        error?.cause?.message ||
        error?.message ||
        'Unknown downstream error';
      throw new BadGatewayException(`AI microservice request failed (${aiServiceUrl}/extract): ${reason}`);
    }

    const extractionPayload = response.data;
    const blockingIssues = await this.computeBlockingIssues(extractionPayload);

    record.extractedJson = { ...extractionPayload, blockingIssues };
    record.extractionStatus = 'extracted';
    await this.filesService.save(record);

    return {
      fileId: record.id,
      ...extractionPayload,
      blockingIssues,
    };
  }

  private async computeBlockingIssues(extractionPayload: any): Promise<string[]> {
    const issues: string[] = [];

    const contractor = extractionPayload?.extraction?.contractor;
    const building = extractionPayload?.extraction?.building;

    if (contractor?.license_number) {
      const existing = await this.contractorRepo.findOne({ where: { licenseNumber: contractor.license_number } });
      if (existing && !existing.isActive) {
        issues.push('Contractor is inactive in the registry.');
      }
      if (existing && new Date(existing.licenseExpiryDate) < new Date()) {
        issues.push('Contractor license is expired.');
      }
    }

    let existingBuilding: Building | null = null;
    if (building?.permit_number) {
      existingBuilding = await this.buildingRepo.findOne({ where: { permitNumber: building.permit_number } });
    }
    if (!existingBuilding && building?.address) {
      existingBuilding = await this.buildingRepo.findOne({ where: { address: building.address } });
    }

    if (existingBuilding) {
      const activeOrder = await this.workOrderRepo.findOne({
        where: { building: { id: existingBuilding.id }, status: 'active' },
        relations: { building: true, contractor: true },
      });
      if (activeOrder) {
        issues.push('This building already has an active work order.');
      }
    }

    return issues;
  }

  async confirm(dto: ConfirmDocumentDto) {
    await this.contractorsService.reconcileExpiredLicenses();

    const file = await this.filesService.getById(dto.fileId);
    const payload = file.extractedJson as any;
    if (!payload?.extraction) {
      throw new BadRequestException('No extraction data found for file.');
    }

    const extracted = payload.extraction;
    const contractorInput = {
      name: dto.contractor?.name ?? extracted?.contractor?.name,
      licenseNumber: dto.contractor?.licenseNumber ?? extracted?.contractor?.license_number,
      licenseExpiryDate: dto.contractor?.licenseExpiryDate ?? extracted?.contractor?.license_expiry_date,
      phone: dto.contractor?.phone ?? extracted?.contractor?.phone,
    };

    const buildingInput = {
      address: dto.building?.address ?? extracted?.building?.address,
      permitNumber: dto.building?.permitNumber ?? extracted?.building?.permit_number,
      ownerName: dto.building?.ownerName ?? extracted?.building?.owner_name,
    };

    const workOrderInput = {
      description: dto.workOrder?.description ?? extracted?.work_order?.description,
      status: dto.workOrder?.status ?? extracted?.work_order?.status ?? 'active',
    };

    const entityType = extracted?.entity_type as string | undefined;
    if (!entityType || !['Contractor', 'Building', 'WorkOrder', 'Mixed'].includes(entityType)) {
      throw new BadRequestException('Unsupported entity type in extraction payload.');
    }
    const needsContractor = entityType === 'Contractor' || entityType === 'WorkOrder' || entityType === 'Mixed';
    const needsBuilding = entityType === 'Building' || entityType === 'WorkOrder' || entityType === 'Mixed';
    const needsWorkOrder = entityType === 'WorkOrder' || entityType === 'Mixed';

    let contractor: Contractor | null = null;
    let building: Building | null = null;
    let createdWorkOrder: WorkOrder | null = null;

    if (needsContractor) {
      if (!contractorInput.licenseNumber || !contractorInput.name || !contractorInput.licenseExpiryDate) {
        throw new BadRequestException('Contractor data is incomplete.');
      }

      contractor = await this.contractorRepo.findOne({ where: { licenseNumber: contractorInput.licenseNumber } });
      if (!contractor) {
        contractor = await this.contractorsService.create({
          name: contractorInput.name,
          licenseNumber: contractorInput.licenseNumber,
          licenseExpiryDate: contractorInput.licenseExpiryDate,
          phone: contractorInput.phone,
        });
      }
    }

    if (needsBuilding) {
      if (!buildingInput.address) {
        throw new BadRequestException('Building address is required.');
      }
      building = await this.buildingsService.findOrCreate(buildingInput);
    }

    if (needsWorkOrder) {
      if (!contractor || !building) {
        throw new BadRequestException('Work order confirmation requires valid contractor and building data.');
      }

      const activeForBuilding = await this.workOrderRepo.findOne({
        where: { building: { id: building.id }, status: 'active' },
        relations: { building: true, contractor: true },
      });
      if (activeForBuilding) {
        throw new BadRequestException('Cannot confirm: target building already has an active work order.');
      }

      createdWorkOrder = await this.workOrdersService.create({
        buildingId: building.id,
        contractorId: contractor.id,
        description: workOrderInput.description,
      });

      if (workOrderInput.status && workOrderInput.status !== 'active') {
        await this.workOrdersService.updateStatus(createdWorkOrder.id, { status: workOrderInput.status });
      }
    }

    file.extractionStatus = 'confirmed';
    await this.filesService.save(file);

    return {
      message: 'Document confirmed and records persisted.',
      contractor,
      building,
      workOrder: createdWorkOrder,
    };
  }
}
