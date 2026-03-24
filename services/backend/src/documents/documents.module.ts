import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from '../buildings/building.entity';
import { BuildingsModule } from '../buildings/buildings.module';
import { Contractor } from '../contractors/contractor.entity';
import { ContractorsModule } from '../contractors/contractors.module';
import { FileRecord } from '../files/file.entity';
import { FilesModule } from '../files/files.module';
import { WorkOrder } from '../work-orders/work-order.entity';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileRecord, Contractor, Building, WorkOrder]),
    FilesModule,
    ContractorsModule,
    BuildingsModule,
    WorkOrdersModule,
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentModule {}
