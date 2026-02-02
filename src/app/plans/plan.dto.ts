import {
  IsArray,
  IsBoolean,
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

  @IsString()
  hint: string;

  @IsBoolean()
  recommend: boolean;

  @IsOptional()
  @IsArray()
  description?: string[];

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;
}
export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  description?: string[];

  @IsOptional()
  @IsString()
  hint: string;

  @IsOptional()
  @IsBoolean()
  recommend: boolean;

  @IsOptional()
  @IsEnum(InsuranceTypeEnum)
  insuranceType?: InsuranceTypeEnum;
}
