import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  createCarDocumentDto,
  CreateGroupHealthDocDto,
  createHealthDocumentDto,
  createLifeDocumentDto,
  CreateRefundDto,
  CreateRenewDto,
  documentSelect,
  updateDocument,
  UpdateRefundDto,
  UpdateRenewDto,
} from "./document.dto";
import { InsuranceTypeEnum, Prisma } from "@prisma/client";
import { NotificationService } from "../notification/notification.service";
import { EmailService } from "../email/email.service";

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationService,
    private emailService: EmailService,
  ) {}

  async createCarDocument(data: createCarDocumentDto, userId: number) {
    const rule = await this.prisma.carRules.findUnique({
      where: {
        id: data.ruleId,
      },
      include: {
        insuranceCompany: true,
      },
    });
    console.log(data);

    if (!rule) {
      throw new NotFoundException("rule not found");
    }

    const carYear = await this.prisma.carYear.findUnique({
      where: {
        id: data.carYearId,
      },
    });

    if (!carYear) {
      throw new NotFoundException("car not found");
    }

    let finalPrice = (data.price * rule.persitage) / 100;

    if (data.offerId) {
      const offer = await this.prisma.offers.findUnique({
        where: { id: data.offerId },
      });
      console.log(data.offerId);

      if (!offer) throw new NotFoundException("Offer not found");

      const discountAmount = (finalPrice * offer.discount) / 100;

      finalPrice = finalPrice - discountAmount;
    }

    const document = await this.prisma.insuranceDocument.create({
      data: {
        insuranceType: "CAR",
        paid: false,
        userId: userId,
        planId: rule.planId,
        companyId: rule.insuranceCompanyId,
        offerId: data.offerId,
      },
    });

    console.log("document", document);

    await this.prisma.insuranceDocumentCarInfo.create({
      data: {
        persitage: rule.persitage,
        price: data.price,
        finalPrice: finalPrice,
        ruleId: data.ruleId,
        carYearId: data.carYearId,
        insuranceDocumentId: document.id,
        idImage: data.idFile,
        carLicence: data.carLicenseFile,
        driveLicence: data.driveLicenseFile,
      },
    });

    if (rule.insuranceCompany?.email) {
      await this.emailService.sendCompanyDocumentEmail(
        rule.insuranceCompany.email,
        {
          documentId: document.id,
          price: data.price,
          finalPrice,
          carYear: carYear.year.toString(),
          idImage: data.idFile,
          carLicence: data.carLicenseFile,
          driveLicence: data.driveLicenseFile,
        },
      );
    }
    return document;
  }

  async createLifeDocument(data: createLifeDocumentDto, userId: number) {
    const rule = await this.prisma.lifeRules.findUnique({
      where: {
        id: data.ruleId,
      },
      include: {
        insuranceCompany: true,
      },
    });

    if (!rule) {
      throw new NotFoundException("rule not found");
    }

    let finalPrice = (data.price * rule.persitage) / 100;

    if (data.offerId) {
      const offer = await this.prisma.offers.findUnique({
        where: { id: data.offerId },
      });

      if (!offer) throw new NotFoundException("Offer not found");

      const discountAmount = (finalPrice * offer.discount) / 100;

      finalPrice = finalPrice - discountAmount;
    }

    const document = await this.prisma.insuranceDocument.create({
      data: {
        insuranceType: "LIFE",
        userId: userId,
        planId: rule.planId,
        companyId: rule.insuranceCompanyId,
        offerId: data.offerId,
      },
    });

    await this.prisma.insuranceDocumentLifeInfo.create({
      data: {
        persitage: rule.persitage,
        price: data.price,
        finalPrice: finalPrice,
        ruleId: data.ruleId,
        insuranceDocumentId: document.id,
        idImage: data.idFile,
      },
    });

    if (rule.insuranceCompany?.email) {
      try {
        await this.emailService.sendLifeDocumentEmail(
          rule.insuranceCompany.email,
          {
            documentId: document.id,
            price: data.price,
            finalPrice,
            idImage: data.idFile,
          },
        );
      } catch (error) {
        console.error("Life document email failed:", error);
      }
    }

    return document;
  }

  async createIndividualHealthDocument(
    data: createHealthDocumentDto,
    userId: number,
  ) {
    const rule = await this.prisma.healthRules.findUnique({
      where: {
        id: data.ruleId,
      },
    });

    if (!rule) {
      throw new NotFoundException("rule not found");
    }
    let finalPrice = rule.price;

    if (data.offerId) {
      const offer = await this.prisma.offers.findUnique({
        where: { id: data.offerId },
      });

      if (!offer) throw new NotFoundException("Offer not found");

      const discountAmount = (finalPrice * offer.discount) / 100;

      finalPrice = finalPrice - discountAmount;
    }

    const document = await this.prisma.insuranceDocument.create({
      data: {
        insuranceType: "HEALTH",
        userId: userId,
        planId: rule.planId,
        companyId: rule.insuranceCompanyId,
      },
      include: {
        company: true,
      },
    });

    await this.prisma.insuranceDocumentHealthInfo.create({
      data: {
        totalPrice: finalPrice,
        insuranceDocumentId: document.id,
        type: "INDIVIDUAL",
        members: {
          create: {
            age: data.age,
            idImage: data.idFile,
            image: data.avatar,
            gender: data.gender,
            price: finalPrice,
            ruleId: data.ruleId,
          },
        },
      },
    });
    if (document.company?.email) {
      try {
        await this.emailService.sendIndividualHealthDocumentEmail(
          document.company.email,
          {
            documentId: document.id,
            age: data.age,
            gender: data.gender,
            price: finalPrice,
            idImage: data.idFile,
            avatar: data.avatar,
          },
        );
      } catch (error) {
        console.error("Individual health email failed", error);
      }
    }
    return document;
  }

  async createManyHealthDocument(data: any, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ Validate plan
      const plan = await tx.insurancePlan.findUnique({
        where: { id: data.planId },
      });

      if (!plan) {
        throw new NotFoundException("Plan not found");
      }

      if (!data.members.length) {
        throw new BadRequestException("Members required");
      }

      // 2️⃣ Build members with automatic rule selection
      let totalPrice = 0;

      const membersCreate = [];

      for (const member of data.members) {
        const rule = await tx.healthRules.findFirst({
          where: {
            planId: data.planId,
            insuranceCompanyId: data.companyId,
            gender: member.gender,
            from: { lte: member.age },
            to: { gte: member.age },
          },
        });

        if (!rule) {
          throw new BadRequestException(
            `No rule found for age ${member.age} and gender ${member.gender}`,
          );
        }

        totalPrice += rule.price;

        membersCreate.push({
          age: member.age,
          gender: member.gender,
          price: rule.price,
          image: member.avatar ?? "",
          idImage: member.idFile ?? "",
          ruleId: rule.id,
        });
      }

      if (data.offerId) {
        const offer = await this.prisma.offers.findUnique({
          where: { id: data.offerId },
        });

        if (!offer) throw new NotFoundException("Offer not found");

        const discountAmount = (totalPrice * offer.discount) / 100;

        totalPrice = totalPrice - discountAmount;
      }
      // 3️⃣ Create document with nested relations
      const document = await tx.insuranceDocument.create({
        data: {
          insuranceType: "HEALTH",
          userId,
          planId: data.planId,
          companyId: data.companyId,
          offerId: data.offerId,
          healthInfo: {
            create: {
              type: data.type,
              totalPrice,
              groupName: data.groupName,
              companyTaxRegister: data.companyTaxRegister,
              companyCommercialRegister: data.companyCommercialRegister,
              members: {
                create: membersCreate,
              },
            },
          },
        },
        include: {
          company: true,
          healthInfo: {
            include: {
              members: true,
            },
          },
        },
      });

      if (document.companyId) {
        if (document.company?.email) {
          try {
            await this.emailService.sendGroupHealthDocumentEmail(
              document.company.email,
              {
                documentId: document.id,
                totalPrice,
                groupName: data.groupName,
                members: membersCreate,
              },
            );
          } catch (error) {
            console.error("Group health email failed", error);
          }
        }
      }
      return document;
    });
  }

  async getAll(query: {
    page?: number;
    size?: number;
    companyId?: number;
    planId?: number;
    userId?: number;
    confirmed?: boolean;
    insuranceType?: InsuranceTypeEnum;
  }) {
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 10;

    const where: Prisma.InsuranceDocumentWhereInput = {
      companyId: query.companyId,
      planId: query.planId,
      userId: query.userId,
      confirmed: query.confirmed,
      insuranceType: query.insuranceType,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.insuranceDocument.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: "desc" },
        select: documentSelect,
      }),
      this.prisma.insuranceDocument.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getOne(id: number) {
    const document = await this.prisma.insuranceDocument.findUnique({
      where: { id },
      select: documentSelect,
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return document;
  }

  async getOneByDocumentNumber(documentNumber: string) {
    const document = await this.prisma.insuranceDocument.findFirst({
      where: { documentNumber },
      select: documentSelect,
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return document;
  }

  async updateDocument(
    id: number,
    data:
      | createCarDocumentDto
      | createLifeDocumentDto
      | createHealthDocumentDto
      | CreateGroupHealthDocDto,
  ) {
    const document = await this.prisma.insuranceDocument.findUnique({
      where: { id },
      include: {
        carInfo: true,
        lifeInfo: true,
        healthInfo: {
          include: { members: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    switch (document.insuranceType) {
      case "CAR":
        return this.updateCarDocument(id, data as createCarDocumentDto);

      case "LIFE":
        return this.updateLifeDocument(id, data as createLifeDocumentDto);

      case "HEALTH":
        if (document.healthInfo?.type === "INDIVIDUAL") {
          return this.updateIndividualHealthDocument(
            id,
            data as createHealthDocumentDto,
          );
        } else {
          return this.updateGroupHealthDocument(
            id,
            data as CreateGroupHealthDocDto,
          );
        }

      default:
        throw new BadRequestException("Unsupported type");
    }
  }

  async updateCarDocument(id: number, data: createCarDocumentDto) {
    // const rule = await this.prisma.carRules.findUnique({
    //   where: { id: data.ruleId },
    // });

    // if (!rule) throw new NotFoundException("Rule not found");

    await this.prisma.insuranceDocument.update({
      where: { id },
      data: {
        paidKey: data.paidKey,
        paid: data.paidKey ? true : false,
      },
    });

    return this.prisma.insuranceDocumentCarInfo.update({
      where: { insuranceDocumentId: id },
      data: {
        // price: data.price,
        // finalPrice: (data.price * rule.persitage) / 100,
        // ruleId: data.ruleId,
        // carYearId: data.carYearId,

        ...(data.idFile && { idImage: data.idFile }),
        ...(data.carLicenseFile && { carLicence: data.carLicenseFile }),
        ...(data.driveLicenseFile && { driveLicence: data.driveLicenseFile }),
      },
    });
  }

  async updateLifeDocument(id: number, data: createLifeDocumentDto) {
    // const rule = await this.prisma.lifeRules.findUnique({
    //   where: { id: data.ruleId },
    // });

    // if (!rule) throw new NotFoundException("Rule not found");

    await this.prisma.insuranceDocument.update({
      where: { id },
      data: {
        paidKey: data.paidKey,
        paid: data.paidKey ? true : false,
      },
    });

    return this.prisma.insuranceDocumentLifeInfo.update({
      where: { insuranceDocumentId: id },
      data: {
        // price: data.price,
        // finalPrice: (data.price * rule.persitage) / 100,
        // ruleId: data.ruleId,

        ...(data.idFile && { idImage: data.idFile }),
      },
    });
  }

  async updateIndividualHealthDocument(
    id: number,
    data: createHealthDocumentDto,
  ) {
    // const rule = await this.prisma.healthRules.findUnique({
    //   where: { id: data.ruleId },
    // });

    // if (!rule) throw new NotFoundException("Rule not found");

    await this.prisma.insuranceDocument.update({
      where: { id },
      data: {
        paidKey: data.paidKey,
        paid: data.paidKey ? true : false,
      },
    });

    const healthInfo = await this.prisma.insuranceDocumentHealthInfo.findUnique(
      {
        where: { insuranceDocumentId: id },
        include: { members: true },
      },
    );

    const memberId = healthInfo.members[0].id;

    await this.prisma.member.update({
      where: { id: memberId },
      data: {
        age: data.age,
        gender: data.gender,
        // price: rule.price,
        // ruleId: rule.id,

        ...(data.avatar && { image: data.avatar }),
        ...(data.idFile && { idImage: data.idFile }),
      },
    });

    return this.prisma.insuranceDocumentHealthInfo.update({
      where: { insuranceDocumentId: id },
      data: {
        // totalPrice: rule.price,
      },
    });
  }

  async updateGroupHealthDocument(id: number, data: CreateGroupHealthDocDto) {
    return this.prisma.$transaction(async (tx) => {
      const healthInfo = await tx.insuranceDocumentHealthInfo.findUnique({
        where: { insuranceDocumentId: id },
      });

      if (!healthInfo) {
        throw new NotFoundException("Health info not found");
      }

      await this.prisma.insuranceDocument.update({
        where: { id },
        data: {
          paidKey: data.paidKey,
          paid: data.paidKey ? true : false,
        },
      });

      // delete old members
      // await tx.member.deleteMany({
      //   where: {
      //     insuranceDocumentHealthInfoId: healthInfo.id,
      //   },
      // });

      // recreate members
      // let totalPrice = 0;
      // const membersCreate = [];

      // for (const member of data.members) {
      //   const rule = await tx.healthRules.findFirst({
      //     where: {
      //       planId: data.planId,
      //       insuranceCompanyId: data.companyId,
      //       gender: member.gender,
      //       from: { lte: member.age },
      //       to: { gte: member.age },
      //     },
      //   });

      //   totalPrice += rule.price;

      //   membersCreate.push({
      //     age: member.age,
      //     gender: member.gender,
      //     price: rule.price,
      //     image: member.avatar,
      //     idImage: member.idFile,
      //     ruleId: rule.id,
      //   });
      // }

      return tx.insuranceDocumentHealthInfo.update({
        where: { insuranceDocumentId: id },
        data: {
          // totalPrice,
          // groupName: data.groupName,
          // companyTaxRegister: data.companyTaxRegister,
          // companyCommercialRegister: data.companyCommercialRegister,
          // members: {
          //   create: membersCreate,
          // },
        },
        include: {
          members: true,
        },
      });
    });
  }

  async createRenew(dto: CreateRenewDto) {
    const document = await this.prisma.insuranceDocument.findUnique({
      where: { id: dto.documentId },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return this.prisma.insuranceDocumentRenew.create({
      data: {
        insuranceDocumentId: dto.documentId,
        paidKey: dto.paidKey,
      },
    });
  }

  async confirmDocument(id: number, dto: updateDocument) {
    const document = await this.prisma.insuranceDocument.update({
      where: { id },
      data: {
        confirmed: true,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        documentNumber: dto.documentNumber,
      },
      select: {
        id: true,
        user: true,
        userId: true,
        documentNumber: true,
      },
    });

    await this.notificationsService.sendNotification({
      title: `تأكيد الوثيقه`,
      content: `تم تأكيد الوثيقه الخاص بك رقم الوثيقه ${document.documentNumber}`,
      userId: document.userId,
    });

    return document;
  }

  async confirmDocumentRenew(id: number) {
    const renewRequest = await this.prisma.insuranceDocumentRenew.findUnique({
      where: { id },
    });

    if (!renewRequest) {
      throw new NotFoundException("Document not found");
    }

    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const updated = await this.prisma.insuranceDocumentRenew.update({
      where: { id },
      data: {
        confirmed: true,
        insuranceDocument: {
          update: {
            startDate,
            endDate,
          },
        },
      },
      include: {
        insuranceDocument: true,
      },
    });
    await this.notificationsService.sendNotification({
      title: `تجديد الوثيقه`,
      content: `تم تجديد الوثيقه الخاص بك رقم الوثيقه ${updated.insuranceDocument.documentNumber}`,
      userId: updated.insuranceDocument.userId,
    });
    return { message: "success" };
  }

  async updateRenew(id: number, dto: UpdateRenewDto) {
    return this.prisma.insuranceDocumentRenew.update({
      where: { id },
      data: {
        confirmed: dto.confirmed,
        paidKey: dto.paidKey,
        paid: dto.paidKey ? true : undefined,
      },
    });
  }

  async createRefund(dto: CreateRefundDto) {
    const document = await this.prisma.insuranceDocument.findUnique({
      where: { id: dto.documentId },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return this.prisma.refund.create({
      data: {
        insuranceDocumentId: dto.documentId,
        carNumber: dto.carNumber,
        description: dto.description,
        idImage: dto.idImage,
        carLicence: dto.carLicence,
        driveLicence: dto.driveLicence,
      },
    });
  }

  async updateRefund(id: number, dto: UpdateRefundDto) {
    return this.prisma.refund.update({
      where: { id },
      data: {
        status: dto.status,
        description: dto.description,

        ...(dto.idImage && { idImage: dto.idImage }),
        ...(dto.carLicence && { carLicence: dto.carLicence }),
        ...(dto.driveLicence && { driveLicence: dto.driveLicence }),
      },
    });
  }

  async getAllRenewRequests(query: {
    page?: number;
    size?: number;
    userId?: number;
    documentId?: number;
    confirmed?: boolean;
    paid?: boolean;
  }) {
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 10;

    const where: Prisma.InsuranceDocumentRenewWhereInput = {
      insuranceDocumentId: query.documentId,
      confirmed: query.confirmed,
      paid: query.paid,
      insuranceDocument: {
        userId: query.userId,
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.insuranceDocumentRenew.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          confirmed: true,
          paid: true,
          paidKey: true,
          createdAt: true,
          insuranceDocument: {
            select: {
              id: true,
              insuranceType: true,
              startDate: true,
              endDate: true,
              documentNumber: true,
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
                  logo: true,
                  link: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.insuranceDocumentRenew.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getAllRefundRequests(query: {
    page?: number;
    size?: number;
    userId?: number;
    documentId?: number;
    status?: string;
  }) {
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 10;

    const where: Prisma.RefundWhereInput = {
      insuranceDocumentId: query.documentId,
      status: query.status,
      insuranceDocument: {
        userId: query.userId,
      },
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.refund.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          carNumber: true,
          createdAt: true,
          idImage: true,
          carLicence: true,
          driveLicence: true,
          description: true,
          insuranceDocument: {
            select: documentSelect,
          },
        },
      }),

      this.prisma.refund.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}
