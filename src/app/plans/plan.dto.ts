import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { InsuranceTypeEnum } from "@prisma/client";

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;
}
export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InsuranceTypeEnum)
  insuranceType?: InsuranceTypeEnum;
}
