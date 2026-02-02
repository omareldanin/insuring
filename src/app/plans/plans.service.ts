import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePlanDto, UpdatePlanDto } from "./plan.dto";
import { InsuranceTypeEnum } from "@prisma/client";

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    const exists = await this.prisma.insurancePlan.findFirst({
      where: {
        name: dto.name,
        insuranceType: dto.insuranceType,
      },
    });

    if (exists) {
      throw new BadRequestException(
        "Plan already exists with the same name and insurance type",
      );
    }

    const sameexists = await this.prisma.insurancePlan.findFirst({
      where: {
        name: dto.name,
        insuranceType: dto.insuranceType,
      },
    });

    if (sameexists) {
      throw new BadRequestException(
        "Plan already exists with the same name and insurance type",
      );
    }

    return this.prisma.insurancePlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        insuranceType: dto.insuranceType,
        hint: dto.hint,
        recommend: dto.recommend,
      },
    });
  }

  async findAll(type?: InsuranceTypeEnum) {
    const results = await this.prisma.insurancePlan.findMany({
      where: {
        insuranceType: type || undefined,
      },
    });

    return { results };
  }

  async findByType(type: InsuranceTypeEnum) {
    return this.prisma.insurancePlan.findMany({
      where: {
        insuranceType: type,
      },
    });
  }
  async update(id: number, dto: UpdatePlanDto) {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException("Insurance plan not found");
    }

    return this.prisma.insurancePlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        insuranceType: dto.insuranceType,
        hint: dto.hint,
        recommend: dto.recommend,
      },
    });
  }
  async remove(id: number) {
    const plan = await this.prisma.insurancePlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException("Insurance plan not found");
    }

    await this.prisma.insurancePlan.delete({
      where: { id },
    });

    return { message: "Insurance plan deleted successfully" };
  }
}
