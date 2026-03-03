import { PartialType } from "@nestjs/mapped-types";
import { InsuranceTypeEnum } from "@prisma/client";
import { IsArray, IsEnum, IsInt, Min, IsOptional } from "class-validator";

export class CreateOfferDto {
  @IsArray()
  @IsEnum(InsuranceTypeEnum, { each: true })
  insuranceTypes: InsuranceTypeEnum[];

  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) {}
