import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from './dto';
import { Building } from './building.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
  ) {}

  findAll(): Promise<Building[]> {
    return this.buildingRepo.find({ order: { id: 'DESC' } });
  }

  async findById(id: number): Promise<Building> {
    const entity = await this.buildingRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Building ${id} not found`);
    return entity;
  }

  create(dto: CreateBuildingDto): Promise<Building> {
    const entity = this.buildingRepo.create(dto);
    return this.buildingRepo.save(entity);
  }

  async findOrCreate(payload: Partial<Building>): Promise<Building> {
    if (payload.id) {
      const byId = await this.buildingRepo.findOne({ where: { id: payload.id } });
      if (byId) return byId;
    }

    if (payload.permitNumber) {
      const byPermit = await this.buildingRepo.findOne({ where: { permitNumber: payload.permitNumber } });
      if (byPermit) return byPermit;
    }

    if (payload.address) {
      const byAddress = await this.buildingRepo.findOne({ where: { address: payload.address } });
      if (byAddress) return byAddress;
    }

    return this.buildingRepo.save(
      this.buildingRepo.create({
        address: payload.address ?? 'Unknown Address',
        permitNumber: payload.permitNumber,
        ownerName: payload.ownerName,
      }),
    );
  }
}
