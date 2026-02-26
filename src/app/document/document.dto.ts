import { InsuranceHealthTypeEnum, UserGender } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export const documentSelect = {
  id: true,
  insuranceType: true,
  startDate: true,
  endDate: true,
  confirmed: true,
  paid: true,
  paidKey: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      email: true,
      link: true,
    },
  },
  plan: {
    select: {
      id: true,
      name: true,
      arName: true,
    },
  },
  carInfo: {
    select: {
      persitage: true,
      price: true,
      finalPrice: true,
      idImage: true,
      carLicence: true,
      driveLicence: true,
      carYear: {
        select: {
          year: true,
          model: {
            select: {
              name: true,
              make: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
  lifeInfo: {
    select: {
      persitage: true,
      price: true,
      finalPrice: true,
      idImage: true,
    },
  },
  healthInfo: {
    select: {
      type: true,
      totalPrice: true,
      groupName: true,
      companyTaxRegister: true,
      companyCommercialRegister: true,
      members: true,
    },
  },
};
export class createCarDocumentDto {
  @IsInt()
  ruleId: number;

  @IsInt()
  carYearId: number;

  @IsOptional()
  @IsString()
  paidKey: string;

  @IsInt()
  price: number;

  @IsString()
  @IsOptional()
  idFile: string;

  @IsString()
  @IsOptional()
  driveLicenseFile: string;

  @IsString()
  @IsOptional()
  carLicenseFile: string;
}

export class createLifeDocumentDto {
  @IsInt()
  ruleId: number;

  @IsOptional()
  @IsString()
  paidKey: string;

  @IsInt()
  price: number;

  @IsString()
  @IsOptional()
  idFile: string;
}

export class createHealthDocumentDto {
  @IsInt()
  ruleId: number;

  @IsOptional()
  @IsString()
  paidKey: string;

  @IsInt()
  age: number;

  @IsString()
  @IsOptional()
  idFile: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsEnum(UserGender)
  gender: UserGender;
}

export class CreateGroupHealthDocDto {
  @IsInt()
  planId: number;

  @IsInt()
  companyId: number;

  @IsEnum(InsuranceHealthTypeEnum)
  type: InsuranceHealthTypeEnum;

  @IsOptional()
  @IsString()
  paidKey: string;

  @IsString()
  @IsOptional()
  groupName: string;

  @IsString()
  @IsOptional()
  companyTaxRegister: string;

  @IsString()
  @IsOptional()
  companyCommercialRegister: string;

  @IsArray()
  @IsNotEmpty()
  members: FamilyMemberDto[];
}

class FamilyMemberDto {
  @IsInt()
  ruleId: number;

  @IsInt()
  @Min(0)
  age: number;

  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsOptional()
  idFile: string;

  @IsString()
  @IsOptional()
  avatar: string;
}
