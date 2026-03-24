import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('file_records')
export class FileRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType?: string | null;

  @Column({ name: 'disk_path', type: 'text', nullable: true })
  diskPath?: string | null;

  @Column({ name: 'extracted_json', type: 'jsonb', nullable: true })
  extractedJson?: Record<string, unknown> | null;

  @Column({ name: 'extraction_status', type: 'varchar', length: 30, default: 'pending' })
  extractionStatus!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
