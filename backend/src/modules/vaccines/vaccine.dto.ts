import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VaccineStatus } from '../../constants/enums';

export class CreateVaccineDto {
  @IsString() petId!: string;
  @IsString() vaccineName!: string;
  @IsOptional() @IsString() batchNo?: string;
  @IsOptional() @IsDateString() administeredDate?: string;
  @IsDateString() nextDueDate!: string;
  @IsString() vetId!: string;
  @IsEnum(VaccineStatus) status!: VaccineStatus;
}

export class UpdateVaccineDto extends CreateVaccineDto {}

export class CompleteVaccineDto {
  /** 本次实际接种日期，不传则取当前时间 */
  @IsOptional() @IsDateString() administeredDate?: string;
}
