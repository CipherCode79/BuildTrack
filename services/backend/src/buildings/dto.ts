import { IsOptional, IsString } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  permitNumber?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;
}
