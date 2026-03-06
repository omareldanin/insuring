import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";

import { OffersService } from "./offers.service";
import { CreateOfferDto, UpdateOfferDto } from "./offers.dto";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";

@Controller("offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOfferDto) {
    return this.offersService.create(dto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query("page") page?: string, @Query("size") size?: string) {
    return this.offersService.findAll({ page: +page, size: +size });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.offersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateOfferDto) {
    return this.offersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.offersService.remove(id);
  }
}
