import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfirmDocumentDto } from './dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('extract')
  @UseInterceptors(FileInterceptor('file'))
  extract(@UploadedFile() file: Express.Multer.File) {
    return this.documentsService.extract(file);
  }

  @Post('confirm')
  confirm(@Body() body: ConfirmDocumentDto) {
    return this.documentsService.confirm(body);
  }
}
