import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class ContractorConfirmDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  licenseNumber?: string;
  @IsOptional()
  @IsString()
  licenseExpiryDate?: string;
  @IsOptional()
  @IsString()
  phone?: string;
}

class BuildingConfirmDto {
  @IsOptional()
  @IsString()
  address?: string;
  @IsOptional()
  @IsString()
  permitNumber?: string;
  @IsOptional()
  @IsString()
  ownerName?: string;
}

class WorkOrderConfirmDto {
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  status?: string;
}

export class ConfirmDocumentDto {
  @IsInt()
  fileId!: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContractorConfirmDto)
  contractor?: ContractorConfirmDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BuildingConfirmDto)
  building?: BuildingConfirmDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkOrderConfirmDto)
  workOrder?: WorkOrderConfirmDto;
}
