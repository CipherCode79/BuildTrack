import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateContractorDto, UpdateContractorDto } from './dto';
import { ContractorsService } from './contractors.service';

@Controller('contractors')
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Get()
  findAll() {
    return this.contractorsService.findAll();
  }

  @Post()
  create(@Body() body: CreateContractorDto) {
    return this.contractorsService.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateContractorDto) {
    return this.contractorsService.update(id, body);
  }
}
