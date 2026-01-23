import {
  Body,
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Get,
  Patch,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  LoggedInUserType,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignupDto,
  UpdateProfileDto,
  VerifyPhoneDto,
} from "./auth.dto";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { UploadImageInterceptor } from "src/middlewares/file-upload.interceptor";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UploadImageInterceptor("avatar")
  @Post("/signUp")
  signUp(
    @Body() signUpDto: SignupDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      signUpDto.avatar = "uploads/" + file.filename;
    }
    return this.authService.signup(signUpDto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @Post("/login")
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @Throttle({
    otp: {
      ttl: 60,
      limit: 3,
    },
  })
  @Post("/sendOtp")
  sendOtp(@Body() data: { phone: string }) {
    return this.authService.sendOtp(data.phone);
  }

  @UseInterceptors(NoFilesInterceptor())
  @Post("/verifyOtp")
  verifyOtp(@Body() dto: VerifyPhoneDto) {
    return this.authService.verifyPhone(dto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @Post("/forget-password")
  forgetPassword(@Body() dto: { identifier: string }) {
    return this.authService.forgotPassword(dto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @Post("/reset-password")
  resetPassword(
    @Body() dto: { phone: string; code: string; newPassword: string },
  ) {
    return this.authService.resetPassword(dto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Patch("/new-password")
  resetPasswordFromOld(
    @Body() dto: { oldPassword: string; newPassword: string },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.authService.resetNewPassword({
      userId: loggedInUser.id,
      oldPassword: dto.oldPassword,
      newPassword: dto.newPassword,
    });
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post("/refresh-token")
  refreshToken(@Body() dto: { refreshToken: string }) {
    return this.authService.refreshToken(dto);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post("/logout")
  logout(@Body() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post("/logoutAll")
  logoutAll(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.authService.logoutAll(loggedInUser.id);
  }

  @Post("/validate-token")
  @UseGuards(JwtAuthGuard)
  validateToken() {
    return {
      message: "success",
    };
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Patch("/edit-profile")
  editProfile(
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    if (file) {
      dto.avatar = "uploads/" + file.filename;
    }

    return this.authService.updateProfile(loggedInUser.id, dto);
  }

  @UploadImageInterceptor("avatar")
  @UseGuards(JwtAuthGuard)
  @Get("/profile")
  getProfile(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.authService.getProfile(loggedInUser.id);
  }
}
