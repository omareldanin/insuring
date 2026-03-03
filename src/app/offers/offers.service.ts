import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOfferDto, UpdateOfferDto } from "./offers.dto";
import { InsuranceTypeEnum } from "@prisma/client";

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  private normalizeTypes(types: InsuranceTypeEnum[]) {
    return [...types].sort();
  }

  private isSameTypes(a: InsuranceTypeEnum[], b: InsuranceTypeEnum[]): boolean {
    if (a.length !== b.length) return false;

    const sortedA = this.normalizeTypes(a);
    const sortedB = this.normalizeTypes(b);

    return sortedA.every((value, index) => value === sortedB[index]);
  }

  async create(dto: CreateOfferDto) {
    const normalized = this.normalizeTypes(dto.insuranceTypes);

    const existingOffers = await this.prisma.offers.findMany({
      where: {
        insuranceTypes: {
          hasEvery: normalized,
        },
      },
      select: {
        id: true,
        insuranceTypes: true,
      },
    });

    const duplicate = existingOffers.find((offer) =>
      this.isSameTypes(offer.insuranceTypes, normalized),
    );

    if (duplicate) {
      throw new ConflictException(
        `Offer already exists with same insurance types: ${normalized.join(", ")}`,
      );
    }

    return this.prisma.offers.create({
      data: {
        insuranceTypes: normalized,
        discount: dto.discount ?? 0,
      },
    });
  }

  async findAll(query: { page: number; size: number }) {
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const skip = (page - 1) * size;

    const [data, total] = await Promise.all([
      this.prisma.offers.findMany({
        skip,
        take: size,
        orderBy: { createdAt: "desc" },
        include: {
          documents: true,
        },
      }),
      this.prisma.offers.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      },
    };
  }

  async findOne(id: number) {
    const offer = await this.prisma.offers.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    });

    if (!offer) throw new NotFoundException("Offer not found");

    return offer;
  }

  async update(id: number, dto: UpdateOfferDto) {
    await this.findOne(id);

    if (dto.insuranceTypes) {
      const normalized = this.normalizeTypes(dto.insuranceTypes);

      const existingOffers = await this.prisma.offers.findMany({
        where: {
          id: { not: id },
          insuranceTypes: {
            hasEvery: normalized,
          },
        },
      });

      const duplicate = existingOffers.find((offer) =>
        this.isSameTypes(offer.insuranceTypes, normalized),
      );

      if (duplicate) {
        throw new ConflictException(
          `Offer already exists with same insurance types`,
        );
      }

      dto.insuranceTypes = normalized;
    }

    return this.prisma.offers.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.offers.delete({
      where: { id },
    });

    return {
      message: "Offer deleted successfully",
    };
  }
}
