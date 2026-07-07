import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import {
  CompanyTypeEnum,
  InsuranceTypeEnum,
  PaymentType,
} from "@prisma/client";
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

  // -------- Payment method --------
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  // required when paymentType = PAYMENT_LINK
  @ValidateIf((o) => o.paymentType === PaymentType.PAYMENT_LINK)
  @IsString()
  paymentLink?: string;

  // required when paymentType = BANK_ACCOUNT
  @ValidateIf((o) => o.paymentType === PaymentType.BANK_ACCOUNT)
  @IsString()
  bankName?: string;

  @ValidateIf((o) => o.paymentType === PaymentType.BANK_ACCOUNT)
  @IsString()
  accountNumber?: string;

  // -------- Plans --------
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
