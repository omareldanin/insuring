import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateHealthRulesDto,
  CreateLifeRulesDto,
  DeleteRulesDto,
  GetOffersDto,
} from "./rules.dto";

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  /* ================= CREATE HEALTH RULES (BULK) ================= */
  async upsertHealthRules(dto: CreateHealthRulesDto) {
    const queries = dto.rules.map((rule) => {
      if (rule.id) {
        // 🔁 UPDATE
        return this.prisma.healthRules.update({
          where: { id: rule.id },
          data: {
            from: rule.from,
            to: rule.to,
            gender: rule.gender,
            insuranceType: rule.insuranceType,
            price: rule.price,
            planId: rule.planId,
            insuranceCompanyId: rule.insuranceCompanyId,
          },
        });
      }

      // ➕ CREATE
      return this.prisma.healthRules.create({
        data: {
          from: rule.from,
          to: rule.to,
          gender: rule.gender,
          insuranceType: rule.insuranceType,
          price: rule.price,
          planId: rule.planId,
          insuranceCompanyId: rule.insuranceCompanyId,
        },
      });
    });

    return this.prisma.$transaction(queries);
  }

  /* ================= CREATE LIFE RULES (BULK) ================= */
  async upsertLifeRules(dto: CreateLifeRulesDto) {
    const queries = dto.rules.map((rule) => {
      if (rule.id) {
        return this.prisma.lifeRules.update({
          where: { id: rule.id },
          data: {
            from: rule.from,
            to: rule.to,
            gender: rule.gender,
            insuranceType: rule.insuranceType,
            persitage: rule.persitage,
            planId: rule.planId,
            insuranceCompanyId: rule.insuranceCompanyId,
          },
        });
      }

      return this.prisma.lifeRules.create({
        data: {
          from: rule.from,
          to: rule.to,
          gender: rule.gender,
          insuranceType: rule.insuranceType,
          persitage: rule.persitage,
          planId: rule.planId,
          insuranceCompanyId: rule.insuranceCompanyId,
        },
      });
    });

    return this.prisma.$transaction(queries);
  }

  /* ================= GET HEALTH OFFERS ================= */
  async getHealthOffers(dto: GetOffersDto) {
    const results = await this.prisma.healthRules.findMany({
      where: {
        planId: dto.planId,
        gender: dto.gender,
        from: { lte: dto.age },
        to: { gte: dto.age },
      },
      select: {
        id: true,
        price: true,
        insuranceCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
            companyPlans: {
              where: {
                planId: dto.planId,
              },
              select: {
                features: true,
              },
            },
          },
        },
      },
    });
    return { results };
  }

  /* ================= GET LIFE OFFERS ================= */
  async getLifeOffers(dto: GetOffersDto) {
    const result = await this.prisma.lifeRules.findMany({
      where: {
        planId: dto.planId,
        gender: dto.gender,
        from: { lte: dto.age },
        to: { gte: dto.age },
      },
      select: {
        id: true,
        persitage: true,
        insuranceCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
            companyPlans: {
              where: {
                planId: dto.planId,
              },
              select: {
                features: true,
              },
            },
          },
        },
      },
    });

    return {
      result: result.map((r) => ({
        ...r,
        finalPrice: (dto.price * r.persitage) / 100,
      })),
    };
  }

  async deleteHealthRules(dto: DeleteRulesDto) {
    const existing = await this.prisma.healthRules.findMany({
      where: {
        id: { in: dto.ids },
      },
      select: { id: true },
    });

    const existingIds = existing.map((r) => r.id);

    const notFoundIds = dto.ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new BadRequestException({
        message: "Some health rules do not exist",
        notFoundIds,
      });
    }

    return this.prisma.healthRules.deleteMany({
      where: {
        id: { in: dto.ids },
      },
    });
  }
  async deleteLifeRules(dto: DeleteRulesDto) {
    const existing = await this.prisma.lifeRules.findMany({
      where: {
        id: { in: dto.ids },
      },
      select: { id: true },
    });

    const existingIds = existing.map((r) => r.id);

    const notFoundIds = dto.ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new BadRequestException({
        message: "Some life rules do not exist",
        notFoundIds,
      });
    }

    return this.prisma.lifeRules.deleteMany({
      where: {
        id: { in: dto.ids },
      },
    });
  }
}
