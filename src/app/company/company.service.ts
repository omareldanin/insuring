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

    return this.prisma.insuranceCompany.create({
      data: {
        name: dto.name,
        arName: dto.arName,
        logo: dto.logo,
        link: dto.link,
        email: dto.email,
        companyType: dto.companyType,
        insuranceTypes: dto.insuranceTypes,
        companyPlans: {
          create: dto.plans.map((plan) => ({
            planId: plan.planId,
            features: plan.features,
            arFeatures: plan.arFeatures,
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
          arName: true,
          email: true,
          logo: true,
          link: true,
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
        arName: true,
        email: true,
        logo: true,
        link: true,
        companyType: true,
        insuranceTypes: true,
        ruleType: true,
        companyPlans: {
          select: {
            id: true,
            features: true,
            arFeatures: true,
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
        arName: dto.arName,
        logo: dto.logo,
        link: dto.link,
        email: dto.email,
        companyType: dto.companyType,
        insuranceTypes: dto.insuranceTypes,
        companyPlans: {
          deleteMany: {},

          create: dto.plans.map((plan) => ({
            planId: plan.planId,
            features: plan.features,
            arFeatures: plan.arFeatures,
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
        arFeatures: dto.arFeatures,
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

  async getStatistics() {
    const totalUsers = await this.prisma.user.count({
      where: { role: "CLIENT" },
    });

    const totalPartners = await this.prisma.user.count({
      where: { role: "PARTNER" },
    });

    const totalCompanies = await this.prisma.insuranceCompany.count();

    const totalDocuments = await this.prisma.insuranceDocument.count();

    const totalConfirmed = await this.prisma.insuranceDocument.count({
      where: { confirmed: true },
    });

    const totalNotConfirmed = await this.prisma.insuranceDocument.count({
      where: { confirmed: false },
    });

    const companiesDocuments = await this.prisma.insuranceDocument.groupBy({
      by: ["companyId"],
      _count: {
        id: true,
      },
    });

    const companies = await this.prisma.insuranceCompany.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const documentsMap = new Map(
      companiesDocuments.map((c) => [c.companyId, c._count.id]),
    );

    const companiesChart = companies.map((company) => ({
      companyId: company.id,
      companyName: company.name,
      documents: documentsMap.get(company.id) || 0,
    }));

    return {
      totalUsers,
      totalPartners,
      totalCompanies,
      totalDocuments,
      totalConfirmed,
      totalNotConfirmed,
      companiesChart,
    };
  }
}
