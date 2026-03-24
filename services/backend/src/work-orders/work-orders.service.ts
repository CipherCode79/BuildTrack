import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuildingsService } from '../buildings/buildings.service';
import { ContractorsService } from '../contractors/contractors.service';
import { CreateWorkOrderDto, UpdateWorkOrderStatusDto } from './dto';
import { WorkOrder } from './work-order.entity';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private readonly workOrderRepo: Repository<WorkOrder>,
    private readonly contractorsService: ContractorsService,
    private readonly buildingsService: BuildingsService,
  ) {}

  async findAll(): Promise<WorkOrder[]> {
    await this.contractorsService.reconcileExpiredLicenses();
    return this.workOrderRepo.find({ order: { id: 'DESC' } });
  }

  async create(dto: CreateWorkOrderDto): Promise<WorkOrder> {
    await this.contractorsService.reconcileExpiredLicenses();

    const contractor = await this.contractorsService.findById(dto.contractorId);
    if (!contractor.isActive) {
      throw new BadRequestException('Contractor is inactive (possibly expired license).');
    }

    const building = await this.buildingsService.findById(dto.buildingId);

    const existingActive = await this.workOrderRepo.findOne({
      where: { building: { id: dto.buildingId }, status: 'active' },
      relations: { building: true, contractor: true },
    });

    if (existingActive) {
      throw new BadRequestException('Only one active work order is allowed per building.');
    }

    const entity = this.workOrderRepo.create({
      building,
      contractor,
      description: dto.description,
      status: 'active',
    });

    return this.workOrderRepo.save(entity);
  }

  async updateStatus(id: number, dto: UpdateWorkOrderStatusDto): Promise<WorkOrder> {
    const order = await this.workOrderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Work order ${id} not found`);
    }

    if (dto.status === 'active') {
      const existingActive = await this.workOrderRepo.findOne({
        where: { building: { id: order.building.id }, status: 'active' },
      });
      if (existingActive && existingActive.id !== order.id) {
        throw new BadRequestException('Another active work order already exists for this building.');
      }
    }

    order.status = dto.status;
    return this.workOrderRepo.save(order);
  }
}
