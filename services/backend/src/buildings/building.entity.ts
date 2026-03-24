import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkOrder } from '../work-orders/work-order.entity';

@Entity('buildings')
export class Building {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  address!: string;

  @Column({ name: 'permit_number', type: 'varchar', length: 100, unique: true, nullable: true })
  permitNumber?: string | null;

  @Column({ name: 'owner_name', type: 'varchar', length: 255, nullable: true })
  ownerName?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.building)
  workOrders!: WorkOrder[];
}
