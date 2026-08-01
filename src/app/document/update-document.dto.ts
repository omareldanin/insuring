import {
  IsString,
  IsInt,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { UserGender } from "@prisma/client";

// --- car ---
class UpdateCarInfoDto {
  @IsOptional() @IsNumber() persitage?: number;
  @IsOptional() @IsInt() price?: number;
  @IsOptional() @IsInt() finalPrice?: number;
  @IsOptional() @IsString() idImage?: string;
  @IsOptional() @IsString() carLicence?: string;
  @IsOptional() @IsString() driveLicence?: string;
}

// --- life ---
class UpdateLifeInfoDto {
  @IsOptional() @IsNumber() persitage?: number;
  @IsOptional() @IsInt() price?: number;
  @IsOptional() @IsInt() finalPrice?: number;
  @IsOptional() @IsString() idImage?: string;
}

// --- health member ---
class UpdateMemberDto {
  @IsInt() id: number; // required to know which member to update
  @IsOptional() @IsInt() age?: number;
  @IsOptional() @IsEnum(UserGender) gender?: UserGender;
  @IsOptional() @IsInt() price?: number;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() idImage?: string;
}

// --- health ---
class UpdateHealthInfoDto {
  @IsOptional() @IsInt() totalPrice?: number;
  @IsOptional() @IsString() groupName?: string;
  @IsOptional() @IsString() companyTaxRegister?: string;
  @IsOptional() @IsString() companyCommercialRegister?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMemberDto)
  members?: UpdateMemberDto[];
}

// --- root ---
export class UpdateDocumentDto {
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsBoolean() confirmed?: boolean;
  @IsOptional() @IsBoolean() paid?: boolean;
  @IsOptional() @IsString() paidKey?: string;
  @IsOptional() @IsString() documentNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCarInfoDto)
  carInfo?: UpdateCarInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLifeInfoDto)
  lifeInfo?: UpdateLifeInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateHealthInfoDto)
  healthInfo?: UpdateHealthInfoDto;
}
