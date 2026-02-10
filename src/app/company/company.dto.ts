import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import {
  CarRuleType,
  CompanyTypeEnum,
  InsuranceTypeEnum,
} from "@prisma/client";
import { OmitType, PartialType } from "@nestjs/mapped-types";

class CompanyPlanDto {
  planId: number;
  features: string; // JSON string OR plain text
}

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  arName: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsEmail()
  email: string;

  @IsEnum(CompanyTypeEnum)
  companyType: CompanyTypeEnum;

  @IsArray()
  @IsEnum(InsuranceTypeEnum, { each: true })
  insuranceTypes: InsuranceTypeEnum[];

  @IsArray()
  @ValidateNested({ each: true })
  companyPlans: {
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
