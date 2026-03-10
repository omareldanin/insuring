import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDiscountCardDto, UpdateDiscountCardDto } from "./card.dto";

@Injectable()
export class DiscountCardService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDiscountCardDto) {
    return this.prisma.discountCard.create({
      data: {
        name: data.name,
        idImage: data.idImage,
        idNumber: data.idNumber,
        confirmed: false,
        userId: data.userId,
      },
    });
  }

  async getAll(filter: {
    page?: number;
    size?: number;
    userId?: number;
    documentId?: number;
    confirmed?: boolean;
    paid?: boolean;
  }) {
    const skip = (filter.page - 1) * filter.size;

    const [data, total] = await Promise.all([
      this.prisma.discountCard.findMany({
        skip,
        take: filter.size,
        where: {
          userId: filter.userId,
          confirmed: filter.confirmed,
          paid: filter.paid,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.discountCard.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page: filter.page,
        size: filter.size,
        pages: Math.ceil(total / filter.size),
      },
    };
  }

  async getOne(id: number) {
    const card = await this.prisma.discountCard.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!card) {
      throw new NotFoundException("Discount card not found");
    }

    return card;
  }

  async update(id: number, data: UpdateDiscountCardDto) {
    await this.getOne(id);

    return this.prisma.discountCard.update({
      where: { id },
      data: {
        paidKey: data.paidKey,
        paid: data.paidKey ? true : undefined,
        confirmed: data.startDate ? true : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.startDate ? new Date(data.endDate) : undefined,
        idImage: data.idImage,
        idNumber: data.idNumber,
      },
    });
  }

  async delete(id: number) {
    await this.getOne(id);

    return this.prisma.discountCard.delete({
      where: { id },
    });
  }
}
