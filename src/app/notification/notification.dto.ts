import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from "class-validator";
import { UserRole } from "@prisma/client";

import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  ValidateIf,
} from "class-validator";

export class SendBroadcastDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // Omitted = broadcast. Empty arrays and null are rejected.
  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNotEmpty({ each: true })
  userIds?: number[];
}
