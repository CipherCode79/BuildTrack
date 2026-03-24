import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../work-orders/work-order.entity';
import { Contractor } from './contractor.entity';
import { ContractorsController } from './contractors.controller';
import { ContractorsService } from './contractors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contractor, WorkOrder])],
  providers: [ContractorsService],
  controllers: [ContractorsController],
  exports: [ContractorsService],
})
export class ContractorsModule {}
