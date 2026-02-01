import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import { UserGender, InsuranceTypeEnum } from "@prisma/client";
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
