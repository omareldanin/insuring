import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateDiscountCardDto {
  @IsString()
  name: string;

  @IsString()
  idNumber: string;

  @IsOptional()
  @IsString()
  idImage: string;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @IsOptional()
  @IsString()
  paidKey?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}

export class UpdateDiscountCardDto extends PartialType(CreateDiscountCardDto) {}
