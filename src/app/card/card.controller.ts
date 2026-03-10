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
} from "@nestjs/common";
import { DiscountCardService } from "./card.service";
import { CreateDiscountCardDto, UpdateDiscountCardDto } from "./card.dto";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { LoggedInUserType } from "../auth/auth.dto";
import { UploadImageInterceptor } from "src/middlewares/file-upload.interceptor";

@Controller("discount-cards")
export class DiscountCardController {
  constructor(private readonly service: DiscountCardService) {}

  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("image")
  @Post("create")
  create(
    @Body() dto: CreateDiscountCardDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    dto.userId = loggedInUser.id;

    if (file) {
      dto.idImage = "uploads/" + file.filename;
    }
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("getAll")
  getAll(@Query("page") page = 1, @Query("size") size = 10, @Req() req) {
    let userId: number | undefined = undefined;

    const loggedInUser = req.user as LoggedInUserType;
    if (loggedInUser.role !== "ADMIN") {
      userId = loggedInUser.id;
    }

    return this.service.getAll(Number(page), Number(size), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.service.getOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("image")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateDiscountCardDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.idImage = "uploads/" + file.filename;
    }
    return this.service.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(Number(id));
  }
}
