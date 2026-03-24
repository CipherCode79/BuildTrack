import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord } from './file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepo: Repository<FileRecord>,
  ) {}

  create(partial: Partial<FileRecord>): Promise<FileRecord> {
    const entity = this.fileRepo.create(partial);
    return this.fileRepo.save(entity);
  }

  async getById(id: number): Promise<FileRecord> {
    const file = await this.fileRepo.findOne({ where: { id } });
    if (!file) throw new NotFoundException(`File ${id} not found`);
    return file;
  }

  save(entity: FileRecord): Promise<FileRecord> {
    return this.fileRepo.save(entity);
  }
}
