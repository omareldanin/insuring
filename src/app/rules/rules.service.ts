import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateCarRuleDto,
  CreateHealthRulesDto,
  CreateLifeRulesDto,
  DeleteRulesDto,
  GetCarOffersDto,
  GetFamilyOffersDto,
  GetOffersDto,
} from "./rules.dto";
import { CarRuleType } from "@prisma/client";

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

  async upsertCarRule(dto: CreateCarRuleDto & { id?: number }) {
    return this.prisma.$transaction(async (tx) => {
      let ruleId: number;

      /* ================= UPDATE ================= */
      if (dto.id) {
        const existing = await tx.carRules.findUnique({
          where: { id: dto.id },
        });

        if (!existing) {
          throw new BadRequestException("Car rule not found");
        }

        const updated = await tx.carRules.update({
          where: { id: dto.id },
          data: {
            ruleType: dto.ruleType,
            persitage: dto.persitage,
            insuranceType: dto.insuranceType,
            planId: dto.planId,
            insuranceCompanyId: dto.insuranceCompanyId,
            from: dto.ruleType === "RANGE" ? dto.from : null,
            to: dto.ruleType === "RANGE" ? dto.to : null,
          },
        });

        ruleId = updated.id;

        // 🔥 If GROUP → reset groups
        if (dto.ruleType === "GROUP") {
          await tx.carRuleGroup.deleteMany({
            where: { ruleId },
          });
        }
      }

      /* ================= CREATE ================= */
      if (!dto.id) {
        const created = await tx.carRules.create({
          data: {
            ruleType: dto.ruleType,
            persitage: dto.persitage,
            insuranceType: dto.insuranceType,
            planId: dto.planId,
            insuranceCompanyId: dto.insuranceCompanyId,
            from: dto.ruleType === "RANGE" ? dto.from : null,
            to: dto.ruleType === "RANGE" ? dto.to : null,
          },
        });

        ruleId = created.id;
      }

      /* ================= GROUP RULE HANDLING ================= */
      if (dto.ruleType === "GROUP") {
        if (!dto.groups || dto.groups.length === 0) {
          throw new BadRequestException("GROUP rule must contain groups");
        }

        const rows = [];

        for (const group of dto.groups) {
          for (const car of group.cars) {
            for (const year of car.years) {
              rows.push({
                ruleId,
                groupName: group.groupName,
                makeId: car.makeId,
                modelId: car.modelId ?? null,
                year,
              });
            }
          }
        }

        await tx.carRuleGroup.createMany({
          data: rows,
        });
      }

      return {
        success: true,
        ruleId,
        mode: dto.id ? "UPDATED" : "CREATED",
      };
    });
  }

  async getAllRules(filters?: {
    planId?: number;
    insuranceCompanyId?: number;
  }) {
    const whereBase: any = {};

    if (filters?.planId) {
      whereBase.planId = filters.planId;
    }

    if (filters?.insuranceCompanyId) {
      whereBase.insuranceCompanyId = filters.insuranceCompanyId;
    }

    /* ================= HEALTH RULES ================= */
    const healthRules = await this.prisma.healthRules.findMany({
      where: whereBase,
      include: {
        plan: true,
        insuranceCompany: true,
      },
      orderBy: { createdAt: "desc" },
    });

    /* ================= LIFE RULES ================= */
    const lifeRules = await this.prisma.lifeRules.findMany({
      where: whereBase,
      include: {
        plan: true,
        insuranceCompany: true,
      },
      orderBy: { createdAt: "desc" },
    });

    /* ================= CAR RULES ================= */
    const carRules = await this.prisma.carRules.findMany({
      where: whereBase,
      include: {
        plan: true,
        insuranceCompany: true,
        carGroups: true,
      },
      orderBy: { createdAt: "desc" },
    });

    /* ================= SPLIT CAR RULES ================= */
    const carRangeRules = carRules
      .filter((r) => r.ruleType === CarRuleType.RANGE)
      .map((r) => ({
        id: r.id,
        from: r.from,
        to: r.to,
        persitage: r.persitage,
        plan: r.plan,
        insuranceCompany: r.insuranceCompany,
        createdAt: r.createdAt,
      }));

    const carGroupRules = carRules
      .filter((r) => r.ruleType === CarRuleType.GROUP)
      .map((r) => {
        const groupsMap = new Map<string, any>();

        for (const g of r.carGroups) {
          if (!groupsMap.has(g.groupName)) {
            groupsMap.set(g.groupName, {
              groupName: g.groupName,
              cars: [],
            });
          }

          groupsMap.get(g.groupName).cars.push({
            makeId: g.makeId,
            modelId: g.modelId,
            year: g.year,
          });
        }

        return {
          id: r.id,
          persitage: r.persitage,
          plan: r.plan,
          insuranceCompany: r.insuranceCompany,
          createdAt: r.createdAt,
          groups: Array.from(groupsMap.values()),
        };
      });

    /* ================= FINAL RESPONSE ================= */
    return {
      health: healthRules,
      life: lifeRules,
      car: {
        range: carRangeRules,
        groups: carGroupRules,
      },
    };
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

  async getHealthFamilyOffers(dto: GetFamilyOffersDto) {
    const { planId, members } = dto;

    const offersByCompany = new Map<number, any>();

    for (const member of members) {
      const rules = await this.prisma.healthRules.findMany({
        where: {
          planId,
          insuranceCompany: {
            companyType: dto.companyType,
          },
          gender: member.gender,
          from: { lte: member.age },
          to: { gte: member.age },
        },
        select: {
          price: true,
          insuranceCompany: {
            select: {
              id: true,
              name: true,
              logo: true,
              companyPlans: {
                where: { planId },
                select: { features: true },
              },
            },
          },
        },
      });

      for (const rule of rules) {
        const companyId = rule.insuranceCompany.id;

        if (!offersByCompany.has(companyId)) {
          offersByCompany.set(companyId, {
            insuranceCompany: rule.insuranceCompany,
            members: [],
            totalPrice: 0,
          });
        }

        const companyOffer = offersByCompany.get(companyId);

        companyOffer.members.push({
          age: member.age,
          gender: member.gender,
          price: rule.price,
        });

        companyOffer.totalPrice += rule.price;
      }
    }

    return {
      results: Array.from(offersByCompany.values()),
    };
  }

  /* ================= GET LIFE OFFERS ================= */
  async getLifeOffers(dto: GetOffersDto) {
    const result = await this.prisma.lifeRules.findMany({
      where: {
        planId: dto.planId,
        insuranceCompany: {
          companyType: dto.companyType,
        },
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

  async getCarOffers(dto: GetCarOffersDto) {
    /* ================= GROUP RULES ================= */
    const rules = await this.prisma.carRules.findMany({
      where: {
        planId: dto.planId,
        insuranceCompany: {
          companyType: dto.companyType,
        },
        OR: [
          {
            from: { gt: dto.price },
            to: { lte: dto.price },
          },
          {
            carGroups: {
              some: {
                makeId: dto.makeId,
                modelId: dto.modelId,
                year: dto.year,
              },
            },
          },
        ],
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

    console.log({
      result: rules.map((r) => ({
        ...r,
        finalPrice: (dto.price * r.persitage) / 100,
      })),
    });

    return {
      result: rules.map((r) => ({
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
