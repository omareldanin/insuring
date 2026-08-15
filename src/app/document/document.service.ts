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
import { LoggedInUserType } from "../auth/auth.dto";
import { confirmDoc, confirmRefund } from "../lib/confirm_doc";
import { UpdateDocumentDto } from "./update-document.dto";
import { promises as fs } from "fs";
import { join } from "path";
@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationService,
    private emailService: EmailService,
  ) {}
  // turns a multer file into the stored relative path
  private filePath(file?: Express.Multer.File): string | undefined {
    return file ? `/uploads/documents/${file.filename}` : undefined;
  }

  buildPaymentMessageAr(company: {
    paymentType: string | null;
    paymentLink: string | null;
    bankName: string | null;
    accountNumber: string | null;
  }): string {
    if (company.paymentType === "PAYMENT_LINK" && company.paymentLink) {
      return `يرجى إتمام الدفع عبر الرابط التالي: ${company.paymentLink}`;
    }

    if (
      company.paymentType === "BANK_ACCOUNT" &&
      company.bankName &&
      company.accountNumber
    ) {
      return `يرجى التحويل على الحساب البنكي التالي:\nالبنك: ${company.bankName}\nرقم الحساب: ${company.accountNumber}`;
    }

    return "سيتم التواصل معك لاحقاً بخصوص طريقة الدفع.";
  }
  async createCarDocument(
    data: createCarDocumentDto,
    loggedInUser: LoggedInUserType,
  ) {
    let userId = loggedInUser.id;
    let partnerId: number | undefined = undefined;
    let salesId: number | undefined = undefined;

    const rule = await this.prisma.carRules.findUnique({
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

    const carYear = await this.prisma.carYear.findUnique({
      where: {
        id: data.carYearId,
      },
    });

    if (!carYear) {
      throw new NotFoundException("car not found");
    }

    let finalPrice = (data.price * rule.persitage) / 100;

    if (loggedInUser.role === "PARTNER" || loggedInUser.role === "SALES") {
      const user = await this.prisma.user.findFirst({
        where: {
          phone: data.phone,
        },
      });

      if (!user) {
        throw new NotFoundException("user not found");
      }

      userId = user.id;

      if (loggedInUser.role === "PARTNER") {
        partnerId = loggedInUser.id;
      } else {
        const user = await this.prisma.user.findUnique({
          where: {
            id: loggedInUser.id,
          },
          select: {
            createdByPartnerId: true,
          },
        });
        partnerId = user.createdByPartnerId;
        salesId = loggedInUser.id;
      }
    }

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
        insuranceType: "CAR",
        paid: false,
        userId: userId,
        planId: rule.planId,
        companyId: rule.insuranceCompanyId,
        offerId: data.offerId,
        partnerId,
        salesId,
      },
    });

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
      try {
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
      } catch (error) {
        console.log(error);
      }
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

  async getAll(
    query: {
      page?: number;
      size?: number;
      companyId?: number;
      planId?: number;
      userId?: number;
      partnerId?: number;
      confirmed?: boolean;
      insuranceType?: InsuranceTypeEnum;
    },
    loggedInUser: LoggedInUserType,
  ) {
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 10;

    const where: Prisma.InsuranceDocumentWhereInput = {
      companyId: query.companyId,
      planId: query.planId,
      confirmed: query.confirmed,
      insuranceType: query.insuranceType,
      userId: loggedInUser.role === "CLIENT" ? loggedInUser.id : undefined,
      partnerId:
        loggedInUser.role === "PARTNER"
          ? loggedInUser.id
          : query.partnerId
            ? query.partnerId
            : undefined,
      salesId: loggedInUser.role === "SALES" ? loggedInUser.id : undefined,
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
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const value = +dto.value;
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
        company: {
          select: {
            paymentType: true,
            paymentLink: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    await this.notificationsService.sendNotification({
      title: `تأكيد الوثيقه`,
      content: `تم تأكيد الوثيقه الخاص بك رقم الوثيقه ${document.documentNumber}`,
      userId: document.userId,
    });

    const paymentMessage = this.buildPaymentMessageAr(document.company);

    await confirmDoc(document.user.phone, {
      documentNumber: document.documentNumber || "",
      startDate: startDate.toDateString() || "",
      endDate: endDate.toDateString() || "",
      value: value.toLocaleString() || "",
      payment: paymentMessage,
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
      include: {
        company: true,
        user: true,
      },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    if (document.company?.refundEmail) {
      await this.emailService.sendCompanyRefundDocumentEmail(
        document.company?.refundEmail,
        {
          documentId: document.documentNumber,
          carNumber: dto.carNumber,
          description: dto.description,
          clientName: document.user.name,
          clientPhone: document.user.phone,
          companyName: document.company.name,
          idImage: dto.idImage,
          carLicence: dto.carLicence,
          driveLicence: dto.driveLicence,
        },
      );
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
    const refund = await this.prisma.refund.findUnique({
      where: {
        id,
      },
      select: {
        insuranceDocument: {
          select: {
            documentNumber: true,
            user: {
              select: {
                id: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    await this.notificationsService.sendNotification({
      title: "تحديث طلب التعويض",
      content: `${dto.status} - ${dto.description}`,
      userId: refund.insuranceDocument.user.id,
    });
    const statusAr = {
      processing: "تحت المعالجة",
      confirmed: "تم الموافقة علي التعويض",
      canceled: "تم الرفض",
    };

    await confirmRefund(refund.insuranceDocument.user.phone, {
      documentNumber: refund.insuranceDocument.documentNumber || "",
      status: statusAr[dto.status] || dto.status,
      notes: dto.description || "لا يوجد",
    });

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
              confirmed: true,
              paid: true,
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
                  logo: true,
                  refundEmail: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.insuranceDocumentRenew.count({ where }),
    ]);
    console.log(data);

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

  async updateDocumentInfo(
    id: number,
    dto: UpdateDocumentDto,
    files?: {
      idImage?: Express.Multer.File[];
      carLicence?: Express.Multer.File[];
      driveLicence?: Express.Multer.File[];
    },
  ) {
    const existing = await this.prisma.insuranceDocument.findUnique({
      where: { id },
      select: { id: true, insuranceType: true },
    });
    if (!existing) throw new NotFoundException("الوثيقة غير موجودة");

    // merge uploaded files into the matching info block
    if (files) {
      const idImage = this.filePath(files.idImage?.[0]);
      const carLicence = this.filePath(files.carLicence?.[0]);
      const driveLicence = this.filePath(files.driveLicence?.[0]);

      if (existing.insuranceType === "CAR") {
        dto.carInfo = {
          ...dto.carInfo,
          ...(idImage && { idImage }),
          ...(carLicence && { carLicence }),
          ...(driveLicence && { driveLicence }),
        };
      }

      if (existing.insuranceType === "LIFE" && idImage) {
        dto.lifeInfo = { ...dto.lifeInfo, idImage };
      }
    }

    // 2. Build the base document update (only fields that were sent)
    const data: Prisma.InsuranceDocumentUpdateInput = {};

    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.confirmed !== undefined) data.confirmed = dto.confirmed;
    if (dto.paid !== undefined) data.paid = dto.paid;
    if (dto.paidKey !== undefined) data.paidKey = dto.paidKey;
    if (dto.documentNumber !== undefined)
      data.documentNumber = dto.documentNumber;

    // 3. Nested update for the matching type only
    if (dto.carInfo && existing.insuranceType === "CAR") {
      data.carInfo = { update: dto.carInfo };
    }

    if (dto.lifeInfo && existing.insuranceType === "LIFE") {
      data.lifeInfo = { update: dto.lifeInfo };
    }

    if (dto.healthInfo && existing.insuranceType === "HEALTH") {
      const { members, ...healthFields } = dto.healthInfo;
      data.healthInfo = { update: healthFields };
    }

    // build a reusable list, e.g. up to 20 members
    const memberFileFields = Array.from({ length: 20 }, (_, i) => [
      { name: `memberImage_${i}`, maxCount: 1 },
      { name: `memberIdImage_${i}`, maxCount: 1 },
    ]).flat();

    if (existing.insuranceType === "HEALTH" && dto.healthInfo?.members) {
      dto.healthInfo.members = dto.healthInfo.members.map((member, i) => {
        const image = this.filePath(files?.[`memberImage_${i}`]?.[0]);
        const idImage = this.filePath(files?.[`memberIdImage_${i}`]?.[0]);
        return {
          ...member,
          ...(image && { image }),
          ...(idImage && { idImage }),
        };
      });
    }

    // 4. Run document (+ its info) update and member updates in one transaction
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.insuranceDocument.update({
        where: { id },
        data,
        include: {
          carInfo: true,
          lifeInfo: true,
          healthInfo: { include: { members: true } },
        },
      });

      // Members are updated one-by-one since each has its own id
      if (
        existing.insuranceType === "HEALTH" &&
        dto.healthInfo?.members?.length
      ) {
        // guard: only allow updating members that belong to this document
        const ownMemberIds = new Set(
          document.healthInfo?.members.map((m) => m.id) ?? [],
        );

        for (const member of dto.healthInfo.members) {
          if (!ownMemberIds.has(member.id)) {
            throw new BadRequestException(
              `العضو رقم ${member.id} لا ينتمي لهذه الوثيقة`,
            );
          }

          const { id: memberId, ...memberFields } = member;
          await tx.member.update({
            where: { id: memberId },
            data: memberFields,
          });
        }

        // re-fetch so the response reflects updated members
        return tx.insuranceDocument.findUnique({
          where: { id },
          include: {
            carInfo: true,
            lifeInfo: true,
            healthInfo: { include: { members: true } },
          },
        });
      }

      return document;
    });
  }
  async deleteDocument(id: number) {
    const existing = await this.prisma.insuranceDocument.findUnique({
      where: { id },
      select: {
        id: true,
        confirmed: true,
        carInfo: {
          select: { idImage: true, carLicence: true, driveLicence: true },
        },
        lifeInfo: { select: { idImage: true } },
        healthInfo: {
          select: {
            companyTaxRegister: true,
            companyCommercialRegister: true,
            members: { select: { image: true, idImage: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException("الوثيقة غير موجودة");
    }

    // block deletion of confirmed documents
    if (existing.confirmed) {
      throw new BadRequestException("لا يمكن حذف وثيقة تم تأكيدها");
    }

    // delete the row — cascade removes carInfo/lifeInfo/healthInfo/members
    await this.prisma.insuranceDocument.delete({ where: { id } });

    // clean up uploaded files from disk (optional but recommended)
    const paths: (string | null | undefined)[] = [
      existing.carInfo?.idImage,
      existing.carInfo?.carLicence,
      existing.carInfo?.driveLicence,
      existing.lifeInfo?.idImage,
      existing.healthInfo?.companyTaxRegister,
      existing.healthInfo?.companyCommercialRegister,
      ...(existing.healthInfo?.members.flatMap((m) => [m.image, m.idImage]) ??
        []),
    ];

    await this.removeFiles(paths);

    return { message: "تم حذف الوثيقة بنجاح" };
  }

  // safely unlink a batch of stored files, ignoring missing ones
  private async removeFiles(paths: (string | null | undefined)[]) {
    await Promise.all(
      paths
        .filter((p): p is string => !!p)
        .map(async (p) => {
          // stored as "/uploads/documents/xxx" -> resolve to disk path
          const filePath = join(process.cwd(), p.replace(/^\//, ""));
          try {
            await fs.unlink(filePath);
          } catch {
            // file already gone or never existed — ignore
          }
        }),
    );
  }
}
