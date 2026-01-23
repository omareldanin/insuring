import {
  BadRequestException,
  Injectable,
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

  // async createUser(dto: CreateUserDto) {
  //   const existing = await this.prisma.user.findUnique({
  //     where: { phone: dto.phone },
  //   });
  //   if (existing) throw new BadRequestException("رقم الهاتف موجود مسبقا");

  //   const hashedPassword = await bcrypt.hash(
  //     dto.password + env.PASSWORD_SALT,
  //     12
  //   );

  //   const user = await this.prisma.user.create({
  //     data: {
  //       phone: dto.phone,
  //       password: hashedPassword,
  //       name: dto.name,
  //       avatar: dto.avatar,
  //       fcm: dto.fcm,
  //       role: dto.role,
  //     },
  //   });

  //   // Create role-specific relation
  //   if (dto.role === "VENDOR") {
  //     await this.prisma.vendor.create({
  //       data: {
  //         address: dto.address,
  //         latitude: dto.latitude,
  //         longitudes: dto.longitudes,
  //         user: { connect: { id: user.id } },
  //       },
  //     });
  //   } else if (dto.role === "DELIVERY") {
  //     await this.prisma.delivery.create({
  //       data: { user: { connect: { id: user.id } } },
  //     });
  //   } else if (dto.role === "ADMIN" || dto.role === "ADMIN_ASSISTANT") {
  //     await this.prisma.admin.create({
  //       data: {
  //         permissions: dto.permissions,
  //         user: { connect: { id: user.id } },
  //       },
  //     });
  //   }

  //   return user;
  // }

  // async findOne(params: {
  //   phone?: string | undefined;
  //   id?: number | undefined;
  // }): Promise<
  //   | Prisma.UserGetPayload<{
  //       select: typeof userSelect;
  //     }>
  //   | undefined
  // > {
  //   return await this.prisma.user.findFirst({
  //     where: params.id
  //       ? {
  //           id: params.id,
  //         }
  //       : {
  //           phone: params.phone,
  //         },
  //     select: userSelect,
  //   });
  // }

  // async getProfile(id: number) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: +id,
  //     },
  //     select: userSelect,
  //   });

  //   return { result: userSelectReform(user) };
  // }

  // async getAllUser(filters: {
  //   role: UserRole;
  //   page: number;
  //   size: number;
  //   phone?: string;
  //   name?: string;
  // }) {
  //   const page = +filters.page || 1;
  //   const pageSize = +filters.size || 10;

  //   const [results, total] = await Promise.all([
  //     this.prisma.user.findMany({
  //       where: {
  //         role: filters.role,
  //         name: filters.name ? { contains: filters.name } : undefined,
  //         phone: filters.phone ? { contains: filters.phone } : undefined,
  //         deleted: false,
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //         phone: true,
  //         avatar: true,
  //         role: true,
  //         deleted: true,
  //         deletedAt: true,
  //         admin: {
  //           select: {
  //             permissions: true,
  //           },
  //         },
  //         vendor: {
  //           select: {
  //             address: true,
  //             latitude: true,
  //             longitudes: true,
  //           },
  //         },
  //         delivery: {
  //           select: {
  //             online: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         id: "asc",
  //       },
  //       skip: (page - 1) * +pageSize,
  //       take: +pageSize,
  //     }),
  //     this.prisma.user.count({
  //       where: {
  //         role: filters.role,
  //       },
  //     }),
  //   ]);

  //   return {
  //     count: total,
  //     page,
  //     totalPages: Math.ceil(total / pageSize),
  //     results: results,
  //   };
  // }

  // async deleteUser(id: number) {
  //   await this.prisma.user.delete({
  //     where: {
  //       id: +id,
  //     },
  //   });

  //   return { message: "success" };
  // }

  // async updateToken(data: {
  //   id: number;
  //   refreshToken?: string;
  //   refreshTokens?: string[];
  //   fcm: string | undefined;
  // }): Promise<{ refresh_token: string[] }> {
  //   return await this.prisma.user.update({
  //     where: {
  //       id: +data.id,
  //     },
  //     data: {
  //       fcm: data.fcm ? data.fcm : undefined,
  //       // Only one session is allowed
  //       refresh_token: data.refreshToken
  //         ? { set: [data.refreshToken] }
  //         : data.refreshTokens
  //           ? { set: data.refreshTokens }
  //           : undefined,
  //     },
  //     select: {
  //       refresh_token: true,
  //     },
  //   });
  // }

  // async getUserByID(userID: number) {
  //   const returnedUser = await this.prisma.user.findUnique({
  //     where: {
  //       id: userID,
  //     },
  //     select: userSelect,
  //   });
  //   return returnedUser;
  // }

  // async getUserRefreshTokens(userID: number) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: userID,
  //     },
  //     select: {
  //       refresh_token: true,
  //     },
  //   });
  //   return user?.refresh_token;
  // }

  // async updateProfile(id: number, data: UpdateUserDto): Promise<User> {
  //   if (data.phone) {
  //     const existing = await this.prisma.user.findUnique({
  //       where: { phone: data.phone },
  //     });
  //     if (existing && +existing.id !== id)
  //       throw new BadRequestException("رقم الهاتف موجود مسبقا");
  //   }
  //   const user = await this.prisma.user.update({
  //     where: {
  //       id: id,
  //     },
  //     data: {
  //       name: data.name,
  //       phone: data.phone,
  //       avatar: data.avatar,
  //       fcm: data.fcm,
  //       vendor: {
  //         update: {
  //           data: {
  //             address: data.address || undefined,
  //             latitude: data.latitude || undefined,
  //             longitudes: data.longitudes || undefined,
  //           },
  //         },
  //       },
  //       delivery: {
  //         update: {
  //           data: {
  //             online:
  //               data.online === "true"
  //                 ? true
  //                 : data.online === "false"
  //                   ? false
  //                   : undefined,
  //           },
  //         },
  //       },
  //     },
  //   });

  //   return user;
  // }

  // async updateUser(id: number, data: UpdateUserDto) {
  //   if (data.phone) {
  //     const existing = await this.prisma.user.findUnique({
  //       where: { phone: data.phone },
  //     });
  //     if (existing && +existing.id !== id)
  //       throw new BadRequestException("رقم الهاتف موجود مسبقا");
  //   }
  //   const user = await this.prisma.user.update({
  //     where: {
  //       id: id,
  //     },
  //     data: {
  //       name: data.name,
  //       phone: data.phone,
  //       avatar: data.avatar,
  //       fcm: data.fcm,
  //       password: data.password
  //         ? bcrypt.hashSync(data.password + (env.PASSWORD_SALT as string), 12)
  //         : undefined,
  //       vendor: {
  //         update: {
  //           data: {
  //             address: data.address || undefined,
  //             latitude: data.latitude || undefined,
  //             longitudes: data.longitudes || undefined,
  //           },
  //         },
  //       },
  //       delivery: {
  //         update: {
  //           data: {
  //             online:
  //               data.online === "true"
  //                 ? true
  //                 : data.online === "false"
  //                   ? false
  //                   : undefined,
  //           },
  //         },
  //       },
  //     },
  //   });

  //   return user;
  // }

  // async resetPassword(data: {
  //   id: number;
  //   password: string;
  // }): Promise<{ token: string }> {
  //   return await this.prisma.user.update({
  //     where: {
  //       id: data.id,
  //     },
  //     data: {
  //       password: bcrypt.hashSync(
  //         data.password + (env.PASSWORD_SALT as string),
  //         12
  //       ),
  //     },
  //     select: {
  //       token: true,
  //     },
  //   });
  // }
}
