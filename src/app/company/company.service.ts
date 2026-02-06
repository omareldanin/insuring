import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyPlanDto,
} from "./company.dto";

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /* ================= CREATE COMPANY ================= */
  async create(dto: CreateCompanyDto) {
    const emailExists = await this.prisma.insuranceCompany.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (emailExists) {
      throw new BadRequestException("Email already exists");
    }
    console.log(dto);

    return this.prisma.insuranceCompany.create({
      data: {
        name: dto.name,
        logo: dto.logo,
        email: dto.email,
        companyType: dto.companyType,
        insuranceTypes: dto.insuranceTypes,
        ruleType: dto.ruleType,
        companyPlans: {
          create: dto.companyPlans.map((plan) => ({
            planId: plan.planId,
            features: plan.features,
          })),
        },
      },
    });
  }

  /* ================= GET ALL (PAGINATION + FILTERS) ================= */
  async findAll(params: {
    page?: number;
    size?: number;
    companyType?: string;
    insuranceType?: string;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const size = params.size ?? 10;

    const where: any = {};

    if (params.companyType) {
      where.companyType = params.companyType;
    }

    if (params.insuranceType) {
      where.insuranceTypes = {
        has: params.insuranceType,
      };
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.insuranceCompany.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          name: true,
          email: true,
          companyType: true,
          insuranceTypes: true,
          ruleType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.insuranceCompany.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        size,
        total,
        pages: Math.ceil(total / size),
      },
    };
  }

  /* ================= GET ONE ================= */
  async findOne(id: number) {
    const company = await this.prisma.insuranceCompany.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        companyType: true,
        insuranceTypes: true,
        ruleType: true,
        companyPlans: {
          select: {
            id: true,
            features: true,
            planId: true,
          },
        },
        createdAt: true,
      },
    });

    if (!company) throw new NotFoundException("Company not found");

    return company;
  }

  /* ================= UPDATE COMPANY ================= */
  async update(id: number, dto: CreateCompanyDto) {
    await this.findOne(id);

    return this.prisma.insuranceCompany.update({
      where: { id },
      data: {
        name: dto.name,
        logo: dto.logo,
        email: dto.email,
        companyType: dto.companyType,
        insuranceTypes: dto.insuranceTypes,
        ruleType: dto.ruleType,
        companyPlans: {
          deleteMany: {},

          create: dto.companyPlans.map((plan) => ({
            planId: plan.planId,
            features: plan.features,
          })),
        },
      },
    });
  }

  /* ================= UPDATE PLAN FEATURES ================= */
  async updatePlanFeatures(
    companyId: number,
    planId: number,
    dto: UpdateCompanyPlanDto,
  ) {
    const plan = await this.prisma.companyPlan.findUnique({
      where: {
        companyId_planId: {
          companyId,
          planId,
        },
      },
    });

    if (!plan) throw new NotFoundException("Company plan not found");

    return this.prisma.companyPlan.update({
      where: {
        companyId_planId: {
          companyId,
          planId,
        },
      },
      data: {
        features: dto.features,
      },
    });
  }

  /* ================= DELETE PLAN FEATURES ================= */
  async deletePlan(companyId: number, planId: number) {
    return this.prisma.companyPlan.delete({
      where: {
        companyId_planId: {
          companyId,
          planId,
        },
      },
    });
  }

  /* ================= DELETE COMPANY ================= */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.insuranceCompany.delete({
      where: { id },
    });
  }
}
