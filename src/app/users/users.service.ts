import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma, User, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { env } from "src/config";
import { PrismaService } from "src/prisma/prisma.service";
import { userSelect, userSelectReform } from "./user.response";
import { CreateUserDto, UpdateUserDto } from "./user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const phone = dto.phone;

    const email = dto.email.toLowerCase();

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
    });

    if (exists) {
      if (exists.phone === phone)
        throw new BadRequestException("رقم الهاتف موجود مسبقا");
      if (exists.email === email)
        throw new BadRequestException("البريد الالكتروني موجود مسبقا");
    }

    const hashedPassword = await bcrypt.hash(
      dto.password + env.PASSWORD_SALT,
      12,
    );

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        name: dto.name,
        avatar: dto.avatar,
        role: dto.role,
        birthDate: new Date(dto.birthDate),
        verified: true,
        email: dto.email,
        gender: dto.gender,
      },
    });
    if (dto.role === "ADMIN") {
      await this.prisma.admin.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
    }
    if (dto.role === "PARTNER") {
      await this.prisma.partner.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
    }
    return user;
  }

  async findOne(params: {
    phone?: string | undefined;
    id?: number | undefined;
  }): Promise<
    | Prisma.UserGetPayload<{
        select: typeof userSelect;
      }>
    | undefined
  > {
    return await this.prisma.user.findFirst({
      where: params.id
        ? {
            id: params.id,
          }
        : {
            phone: params.phone,
          },
      select: userSelect,
    });
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
      select: userSelect,
    });

    return { result: user };
  }

  async getAllUser(filters: {
    role: UserRole;
    page: number;
    size: number;
    phone?: string;
    name?: string;
  }) {
    const page = +filters.page || 1;
    const pageSize = +filters.size || 10;

    const [results, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          role: filters.role,
          name: filters.name ? { contains: filters.name } : undefined,
          phone: filters.phone ? { contains: filters.phone } : undefined,
          deleted: false,
        },
        select: userSelect,
        orderBy: {
          id: "asc",
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.user.count({
        where: {
          role: filters.role,
        },
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results,
    };
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({
      where: {
        id: +id,
      },
    });

    return { message: "success" };
  }

  async getUserByID(userID: number) {
    const returnedUser = await this.prisma.user.findUnique({
      where: {
        id: userID,
      },
      select: userSelect,
    });
    return returnedUser;
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const checkUser = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });

    if (!checkUser) {
      throw new NotFoundException("user not found");
    }

    if (data.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (existing && +existing.id !== id)
        throw new BadRequestException("رقم الهاتف موجود مسبقا");
    }

    let hashedPassword: string | undefined = undefined;

    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password + env.PASSWORD_SALT, 12);
    }

    const user = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        phone: data.phone,
        password: hashedPassword,
        name: data.name,
        avatar: data.avatar,
        role: data.role,
        birthDate: data.birthDate,
        email: data.email,
        gender: data.gender,
      },
    });

    return user;
  }
}
