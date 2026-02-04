import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { UserGender, InsuranceTypeEnum, CarRuleType } from "@prisma/client";
import { Type } from "class-transformer";

export class GetOffersDto {
  @IsInt()
  @Min(0)
  age: number;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsOptional()
  @IsInt()
  planId: number;

  @IsOptional()
  @IsInt()
  price: number;
}

class FamilyMemberDto {
  @IsInt()
  @Min(0)
  age: number;

  @IsEnum(UserGender)
  gender: UserGender;
}

export class GetFamilyOffersDto {
  @IsInt()
  planId: number;

  @IsArray()
  @IsNotEmpty()
  members: FamilyMemberDto[];
}

class HealthRuleItemDto {
  @IsOptional()
  @IsInt()
  id?: number; // 👈 if exists → update

  @IsInt()
  from: number;

  @IsInt()
  to: number;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;

  @IsInt()
  price: number;

  @IsInt()
  planId: number;

  @IsInt()
  insuranceCompanyId: number;
}

export class CreateHealthRulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HealthRuleItemDto)
  rules: HealthRuleItemDto[];
}

class LifeRuleItemDto {
  @IsOptional()
  @IsInt()
  id?: number; // 👈 if exists → update

  @IsInt()
  from: number;

  @IsInt()
  to: number;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;

  @IsInt()
  persitage: number;

  @IsInt()
  planId: number;

  @IsInt()
  insuranceCompanyId: number;
}

export class CreateLifeRulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LifeRuleItemDto)
  rules: LifeRuleItemDto[];
}

export class DeleteRulesDto {
  @IsArray()
  @ArrayNotEmpty({ message: "ids array must not be empty" })
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}

export class CarGroupItemDto {
  @IsInt()
  makeId: number;

  @IsOptional()
  @IsInt()
  modelId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  years: number[];
}

export class CarGroupDto {
  @IsString()
  groupName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarGroupItemDto)
  cars: CarGroupItemDto[];
}

export class CreateCarRuleDto {
  @IsEnum(CarRuleType)
  ruleType: CarRuleType;

  @IsInt()
  persitage: number;

  @IsEnum(InsuranceTypeEnum)
  insuranceType: InsuranceTypeEnum;

  @IsInt()
  planId: number;

  @IsInt()
  insuranceCompanyId: number;

  @IsOptional()
  @IsInt()
  from: number;

  @IsOptional()
  @IsInt()
  to: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarGroupDto)
  groups: CarGroupDto[];
}

export class GetCarOffersDto {
  @IsInt()
  makeId: number;

  @IsInt()
  modelId: number;

  @IsInt()
  year: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  planId: number;
}
