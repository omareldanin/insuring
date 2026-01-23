import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { env } from "src/config";
import { PrismaService } from "src/prisma/prisma.service";
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignupDto,
  UpdateProfileDto,
  VerifyPhoneDto,
} from "./auth.dto";
import { User, UserRole } from "@prisma/client";
import { sendOtpTemplate } from "./helper/sendMessages";
import * as crypto from "crypto";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private notificationsService: NotificationService,
  ) {}

  private isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async signup(dto: SignupDto) {
    const phone = dto.phone;

    const email = dto.email.toLowerCase();

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email }],
      },
    });

    if (exists) {
      if (exists.phone === phone)
        throw new BadRequestException("Phone already exists");
      if (exists.email === email)
        throw new BadRequestException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      dto.password + env.PASSWORD_SALT,
      12,
    );

    const user = await this.prisma.user.create({
      data: {
        phone,
        email,
        name: dto.name,
        gender: dto.gender,
        birthDate: new Date(dto.birthDate),
        password: hashedPassword,
        role: dto.role,
        verified: false,
        avatar: dto.avatar,
      },
    });

    if (dto.role === "PARTNER") {
      await this.prisma.partner.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }

    await this.sendOtp(phone);

    return {
      message: "Account created, OTP sent",
    };
  }

  async sendOtp(phone: string) {
    const lastOtp = await this.prisma.phoneOtp.findFirst({
      where: {
        phone: phone, // ✅
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp) {
      const diff = Date.now() - lastOtp.createdAt.getTime();

      if (diff < 60 * 1000) {
        throw new BadRequestException(
          "Please wait before requesting another OTP",
        );
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.phoneOtp.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendOtpTemplate(phone, code);

    return { message: "OTP sent" };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const otp = await this.prisma.phoneOtp.findFirst({
      where: {
        phone: dto.phone,
        code: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) throw new BadRequestException("Invalid OTP");

    await this.prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { used: true },
    });

    await this.prisma.user.updateMany({
      where: { phone: dto.phone },
      data: { verified: true },
    });

    return { message: "Phone verified" };
  }

  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    const where = this.isEmail(identifier)
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await this.prisma.user.findFirst({ where });

    if (!user || user.deleted)
      throw new UnauthorizedException("Invalid credentials");

    if (!user.active) throw new ForbiddenException("Account disabled");

    const isMatch = bcrypt.compareSync(
      password + (env.PASSWORD_SALT as string),
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    // if (!user.verified) throw new ForbiddenException("Phone not verified");
    const tokens = await this.generateTokens(user);

    const session = await this.prisma.refreshSession.create({
      data: {
        token: tokens.hashedRefresh,
        fcm: dto.fcm,
        userId: user.id,
      },
    });

    if (!user.fcm.includes(dto.fcm)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { fcm: { push: dto.fcm } },
      });
    }

    await this.notificationsService.sendNotification({
      title: `تسجيل الدخول`,
      content: `تم تسجيل الدخول بتاريخ ${session.createdAt.toLocaleString()}`,
      userId: user.id,
    });

    if (!user.verified) {
      await this.sendOtp(user.phone);
    }

    return {
      status: "success",
      verified: user.verified,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async generateTokens(user: User) {
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatar: user.avatar,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: "1d",
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: "7d",
    });

    const hashedRefresh = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    return {
      accessToken,
      refreshToken,
      hashedRefresh,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const where = this.isEmail(dto.identifier)
      ? { email: dto.identifier.toLowerCase() }
      : { phone: dto.identifier };

    const user = await this.prisma.user.findFirst({ where });

    if (!user) return { message: "If user exists, OTP sent" };

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendOtpTemplate(user.phone, code);

    return { message: "OTP sent" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });

    if (!user) throw new BadRequestException("Invalid request");

    const reset = await this.prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        token: dto.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!reset) throw new BadRequestException("Invalid OTP");

    const hashedPassword = await bcrypt.hash(
      dto.newPassword + env.PASSWORD_SALT,
      12,
    );

    await this.prisma.$transaction([
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { used: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      }),
    ]);
    const date = new Date();

    await this.notificationsService.sendNotification({
      title: `تغيير كلمة المرور`,
      content: `تم تغيير كلمه المرور بتاريخ ${date.toLocaleString()}`,
      userId: user.id,
    });

    return { message: "Password updated successfully" };
  }

  async resetNewPassword(dto: {
    userId: number;
    oldPassword: string;
    newPassword: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) throw new BadRequestException("Invalid request");

    const isMatch = bcrypt.compareSync(
      dto.oldPassword + (env.PASSWORD_SALT as string),
      user.password,
    );

    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const hashedPassword = await bcrypt.hash(
      dto.newPassword + env.PASSWORD_SALT,
      12,
    );

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      }),
    ]);
    const date = new Date();

    await this.notificationsService.sendNotification({
      title: `تغيير كلمة المرور`,
      content: `تم تغيير كلمه المرور بتاريخ ${date.toLocaleString()}`,
      userId: user.id,
    });

    return { message: "Password updated successfully" };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: {
      id: number;
      role: UserRole;
      name: string;
      phone: string;
      email: string;
      avatar: string;
    };

    payload = this.jwt.verify(dto.refreshToken);

    const hashed = crypto
      .createHash("sha256")
      .update(dto.refreshToken)
      .digest("hex");

    const session = await this.prisma.refreshSession.findUnique({
      where: { token: hashed },
      include: { user: true },
    });

    if (!session) throw new UnauthorizedException("Session revoked");

    // 🔁 rotation
    await this.prisma.refreshSession.delete({
      where: { token: hashed },
    });

    const tokens = await this.generateTokens(session.user);

    await this.prisma.refreshSession.create({
      data: {
        token: tokens.hashedRefresh,
        fcm: session.fcm,
        userId: session.userId,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string) {
    const hashed = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await this.prisma.refreshSession.findUnique({
      where: { token: hashed },
    });

    if (!session) return { message: "Already logged out" };

    await this.prisma.refreshSession.delete({
      where: { token: hashed },
    });

    await this.prisma.user.update({
      where: { id: session.userId },
      data: {
        fcm: {
          set: (
            await this.prisma.user.findUnique({
              where: { id: session.userId },
              select: { fcm: true },
            })
          )?.fcm.filter((f) => f !== session.fcm),
        },
      },
    });

    return { message: "Logged out from this device" };
  }

  async logoutAll(userId: number) {
    await this.prisma.refreshSession.deleteMany({
      where: { userId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { fcm: [] },
    });

    return { message: "Logged out from all devices" };
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        avatar: true,
        email: true,
        gender: true,
        verified: true,
        birthDate: true,
      },
    });
  }
  async updateProfile(id: number, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException("user not found");
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        avatar: data.avatar,
        email: data.email,
        gender: data.gender,
        birthDate: data.birthDate,
      },
    });

    return updatedUser;
  }
}
