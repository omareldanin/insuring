import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { LoggedInUserType } from "../auth/auth.dto";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import { UploadImageInterceptor } from "src/middlewares/file-upload.interceptor";

@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("avatar")
  @Post("/create-user")
  async create(
    @Body() dto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.avatar = "uploads/" + file.filename; // or save full path if you want
    }

    const user = await this.userService.createUser(dto);
    return { message: "success", user };
  }

  @UseGuards(JwtAuthGuard)
  @Get("/get-profile")
  getUserProfile(@Req() req) {
    const loggedInUser = req.user as LoggedInUserType;

    const user = this.userService.getProfile(+loggedInUser.id);

    return user;
  }

  //update user profile --------------------------
  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("avatar")
  @Patch("/:id")
  async updateUser(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateUserDto,
  ) {
    if (file) {
      data.avatar = "uploads/" + file.filename; // or save full path if you want
    }
    const user = await this.userService.updateUser(+id, data);
    return {
      message: "success",
      user: { ...user, password: null },
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get("/getAll")
  getAll(@Query() filters: any) {
    const result = this.userService.getAllUser(filters);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  deleteUser(@Param("id") id: number) {
    const result = this.userService.deleteUser(+id);

    return result;
  }
}
