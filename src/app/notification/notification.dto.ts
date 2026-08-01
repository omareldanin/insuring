import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { UserRole } from "@prisma/client";

export class SendBroadcastDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
