import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Building } from './buildings/building.entity';
import { BuildingsModule } from './buildings/buildings.module';
import { Contractor } from './contractors/contractor.entity';
import { ContractorsModule } from './contractors/contractors.module';
import { DocumentModule } from './documents/documents.module';
import { FileRecord } from './files/file.entity';
import { FilesModule } from './files/files.module';
import { WorkOrder } from './work-orders/work-order.entity';
import { WorkOrdersModule } from './work-orders/work-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(config.get<string>('DATABASE_PORT', '5432')),
        username: config.get<string>('DATABASE_USER', 'buildtrack'),
        password: config.get<string>('DATABASE_PASSWORD', 'buildtrack_pass'),
        database: config.get<string>('DATABASE_NAME', 'buildtrack_db'),
        entities: [Contractor, Building, WorkOrder, FileRecord],
        synchronize: false,
      }),
    }),
    ContractorsModule,
    BuildingsModule,
    WorkOrdersModule,
    FilesModule,
    DocumentModule,
  ],
})
export class AppModule {}
