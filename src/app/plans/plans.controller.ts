import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CreatePlanDto, UpdatePlanDto } from "./plan.dto";
import { InsuranceTypeEnum } from "@prisma/client";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { PlansService } from "./plans.service";
import { NoFilesInterceptor } from "@nestjs/platform-express";

@Controller("insurance-plans")
export class PlansController {
  constructor(private readonly service: PlansService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post("/create")
  create(@Body() dto: CreatePlanDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/getAll")
  findAll(@Query("type") type: InsuranceTypeEnum) {
    return this.service.findAll(type);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
