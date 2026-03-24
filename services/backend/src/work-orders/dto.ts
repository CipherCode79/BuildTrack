import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateWorkOrderDto {
  @IsInt()
  buildingId!: number;

  @IsInt()
  contractorId!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateWorkOrderStatusDto {
  @IsString()
  status!: string;
}
