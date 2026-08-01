import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NoFilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { LoggedInUserType } from "../auth/auth.dto";
import { SendBroadcastDto } from "./notification.dto";

@Controller("notification")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post("/create")
  sendNotification(
    @Body()
    data: {
      userId: number;
      title: string;
      content: string;
    },
  ) {
    return this.notificationService.sendNotification(data);
  }

  @UseInterceptors(NoFilesInterceptor())
  @UseGuards(JwtAuthGuard)
  @Post("broadcast")
  async broadcast(@Body() dto: SendBroadcastDto) {
    return this.notificationService.sendNotificationToAll(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("/getUserNotifications")
  getUserNotifications(
    @Query("page") page: number,
    @Query("size") size: number,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.notificationService.getUserNotifications({
      page,
      size,
      userId: loggedInUser.id,
      role: loggedInUser.role,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Patch("/updateUserSeen")
  updateUserSeen(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;

    return this.notificationService.updateUserNotificationsSeen({
      userId: +loggedInUser.id,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Patch("/edit/:id")
  updateNotification(@Param() params: any) {
    return this.notificationService.updateNotificationSeen({
      id: +params.id,
    });
  }
}
