import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Building } from '../buildings/building.entity';
import { Contractor } from '../contractors/contractor.entity';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Building, (building) => building.workOrders, { eager: true })
  @JoinColumn({ name: 'building_id' })
  building!: Building;

  @ManyToOne(() => Contractor, (contractor) => contractor.workOrders, { eager: true })
  @JoinColumn({ name: 'contractor_id' })
  contractor!: Contractor;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
