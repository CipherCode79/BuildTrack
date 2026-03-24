import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateWorkOrderDto, UpdateWorkOrderStatusDto } from './dto';
import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  findAll() {
    return this.workOrdersService.findAll();
  }

  @Post()
  create(@Body() body: CreateWorkOrderDto) {
    return this.workOrdersService.create(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateWorkOrderStatusDto) {
    return this.workOrdersService.updateStatus(id, body);
  }
}
