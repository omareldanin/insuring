import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CompanyTypeEnum, InsuranceTypeEnum } from "@prisma/client";
import { OmitType, PartialType } from "@nestjs/mapped-types";

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  arName: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsEmail()
  email: string;

  @IsEnum(CompanyTypeEnum)
  companyType: CompanyTypeEnum;

  @IsArray()
  @IsEnum(InsuranceTypeEnum, { each: true })
  insuranceTypes: InsuranceTypeEnum[];

  @IsOptional()
  @IsString()
  companyPlans: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  plans: {
    planId: number;
    features: string[];
    arFeatures: string[];
  }[];
}

export class UpdateCompanyPlanDto {
  @IsArray()
  features: string[];

  @IsArray()
  arFeatures: string[];
}

export class UpdateCompanyDto extends PartialType(
  OmitType(CreateCompanyDto, ["companyPlans"] as const),
) {}
