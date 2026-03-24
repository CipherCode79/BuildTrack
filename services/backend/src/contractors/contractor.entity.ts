import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkOrder } from '../work-orders/work-order.entity';

@Entity('contractors')
export class Contractor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'license_number', type: 'varchar', length: 100, unique: true })
  licenseNumber!: string;

  @Column({ name: 'license_expiry_date', type: 'date' })
  licenseExpiryDate!: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.contractor)
  workOrders!: WorkOrder[];
}
