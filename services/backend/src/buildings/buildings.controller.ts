import { Body, Controller, Get, Post } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto';

@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  findAll() {
    return this.buildingsService.findAll();
  }

  @Post()
  create(@Body() body: CreateBuildingDto) {
    return this.buildingsService.create(body);
  }
}
