import { UserGender, UserRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from "class-validator";

export interface loginDto {
  phone: string;
  password: string;
  fcm: string | undefined;
}

export interface loginResponse {
  message: string;
  id: number;
  name: string | undefined;
  phone: string;
  avatar: string | undefined;
  wallet: Decimal;
  role: UserRole;
  token: string;
  refreshToken: string[];
}

export interface LoggedInUserType {
  id: number;
  name: string | undefined;
  phone: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export class SignupDto {
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
  image: string;

  @IsString()
  birthDate: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(11)
  phone: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsOptional()
  image: string;

  @IsOptional()
  @IsString()
  birthDate: string;
}
export class LoginDto {
  @IsString()
  identifier: string; // email OR phone

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  fcm: string;
}

export class VerifyPhoneDto {
  phone: string;
  code: string;
}

export class ForgotPasswordDto {
  identifier: string;
}

export class ResetPasswordDto {
  phone: string;
  code: string;
  newPassword: string;
}

export interface JwtPayload {
  sub: number;
  role: UserRole;
}

export class RefreshTokenDto {
  refreshToken: string;
}
