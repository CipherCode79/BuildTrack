import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateContractorDto {
  @IsString()
  name!: string;

  @IsString()
  licenseNumber!: string;

  @IsDateString()
  licenseExpiryDate!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateContractorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
