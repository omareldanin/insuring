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
  arName: string;

  @IsOptional()
  @IsString()
  hint: string;

  @IsOptional()
  @IsString()
  arHint: string;

  @IsBoolean()
  recommend: boolean;

  @IsOptional()
  @IsArray()
  description?: string[];

  @IsOptional()
  @IsArray()
  arDescription?: string[];

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  arName?: string;

  @IsOptional()
  @IsArray()
  description?: string[];

  @IsOptional()
  @IsArray()
  arDescription?: string[];

  @IsOptional()
  @IsString()
  hint: string;

  @IsOptional()
  @IsString()
  arHint: string;

  @IsOptional()
  @IsBoolean()
  recommend: boolean;

  @IsOptional()
  @IsEnum(InsuranceTypeEnum)
  insuranceType?: InsuranceTypeEnum;
}
