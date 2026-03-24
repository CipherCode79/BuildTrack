import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isDateExpired } from '../common/rule-engine';
import { WorkOrder } from '../work-orders/work-order.entity';
import { CreateContractorDto, UpdateContractorDto } from './dto';
import { Contractor } from './contractor.entity';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(Contractor)
    private readonly contractorRepo: Repository<Contractor>,
    @InjectRepository(WorkOrder)
    private readonly workOrderRepo: Repository<WorkOrder>,
  ) {}

  async findAll(): Promise<Contractor[]> {
    await this.reconcileExpiredLicenses();
    return this.contractorRepo.find({ order: { id: 'DESC' } });
  }

  async findById(id: number): Promise<Contractor> {
    const contractor = await this.contractorRepo.findOne({ where: { id } });
    if (!contractor) {
      throw new NotFoundException(`Contractor ${id} not found`);
    }
    return contractor;
  }

  async create(dto: CreateContractorDto): Promise<Contractor> {
    const entity = this.contractorRepo.create({
      name: dto.name,
      licenseNumber: dto.licenseNumber,
      licenseExpiryDate: new Date(dto.licenseExpiryDate),
      phone: dto.phone,
      status: 'active',
      isActive: true,
    });
    return this.contractorRepo.save(entity);
  }

  async update(id: number, dto: UpdateContractorDto): Promise<Contractor> {
    const contractor = await this.findById(id);

    if (dto.name !== undefined) contractor.name = dto.name;
    if (dto.phone !== undefined) contractor.phone = dto.phone;
    if (dto.licenseExpiryDate !== undefined) contractor.licenseExpiryDate = new Date(dto.licenseExpiryDate);
    if (dto.status !== undefined) contractor.status = dto.status;

    if (contractor.status.toLowerCase() !== 'active') {
      contractor.isActive = false;
    }

    return this.contractorRepo.save(contractor);
  }

  async reconcileExpiredLicenses(): Promise<void> {
    const activeContractors = await this.contractorRepo.find({ where: { isActive: true } });

    for (const contractor of activeContractors) {
      const expiryDate = new Date(contractor.licenseExpiryDate);
      if (isDateExpired(expiryDate)) {
        contractor.isActive = false;
        contractor.status = 'inactive';
        await this.contractorRepo.save(contractor);

        const activeOrders = await this.workOrderRepo.find({
          where: { contractor: { id: contractor.id }, status: 'active' },
          relations: { contractor: true, building: true },
        });

        for (const order of activeOrders) {
          order.status = 'cancelled';
          await this.workOrderRepo.save(order);
        }
      }
    }
  }
}
