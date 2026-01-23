import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from "class-validator";
import { UserGender, UserRole } from "@prisma/client";
import { PartialType } from "@nestjs/mapped-types";

export class CreateUserDto {
  @IsString()
  @Length(11)
  phone: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  birthDate: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
