import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { RulesService } from "./rules.service";
import {
  CreateCarRuleDto,
  CreateHealthRulesDto,
  DeleteRulesDto,
  GetCarOffersDto,
  GetFamilyOffersDto,
  GetOffersDto,
} from "./rules.dto";
import { CreateLifeRulesDto } from "./rules.dto";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { NoFilesInterceptor } from "@nestjs/platform-express";

@Controller("rules")
export class RulesController {
  constructor(private readonly service: RulesService) {}

  /* ========= CREATE RULES ========= */
  @UseGuards(JwtAuthGuard)
  @Post("health")
  createHealth(@Body() dto: CreateHealthRulesDto) {
    return this.service.upsertHealthRules(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("life")
  createLife(@Body() dto: CreateLifeRulesDto) {
    return this.service.upsertLifeRules(dto);
  }

  // @UseGuards(JwtAuthGuard)
  @Post("car")
  upsert(@Body() dto: CreateCarRuleDto & { id?: number }) {
    return this.service.upsertCarRule(dto);
  }
  /* ========= GET OFFERS ========= */

  @Get("getRules")
  getAll(
    @Query("planId") planId?: number,
    @Query("companyId") insuranceCompanyId?: number,
  ) {
    return this.service.getAllRules({
      planId: planId ? +planId : undefined,
      insuranceCompanyId: insuranceCompanyId ? +insuranceCompanyId : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post("health/offers")
  getHealthOffers(@Body() dto: GetOffersDto) {
    return this.service.getHealthOffers(dto);
  }

  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post("family/health/offers")
  getFamilyHealthOffers(@Body() dto: GetFamilyOffersDto) {
    return this.service.getHealthFamilyOffers(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post("life/offers")
  getLifeOffers(@Body() dto: GetOffersDto) {
    return this.service.getLifeOffers(dto);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(NoFilesInterceptor())
  @Post("car/offers")
  getOffers(@Body() dto: GetCarOffersDto) {
    return this.service.getCarOffers(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("health/delete")
  deleteHealth(@Body() dto: DeleteRulesDto) {
    return this.service.deleteHealthRules(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("life/delete")
  deleteLife(@Body() dto: DeleteRulesDto) {
    return this.service.deleteLifeRules(dto);
  }
}
