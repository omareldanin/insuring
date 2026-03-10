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

  async getAll(page = 1, size = 10, userId?: number) {
    const skip = (page - 1) * size;

    const [data, total] = await Promise.all([
      this.prisma.discountCard.findMany({
        skip,
        take: size,
        where: {
          userId: userId,
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
        page,
        size,
        pages: Math.ceil(total / size),
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
        confirmed: data.confirmed,
        ...data,
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
