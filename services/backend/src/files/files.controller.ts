import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  getFile(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.getById(id);
  }
}
