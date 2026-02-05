import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyPlanDto,
} from "./company.dto";
import { CompanyService } from "./company.service";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { UploadImageInterceptor } from "src/middlewares/file-upload.interceptor";

@Controller("insurance-companies")
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("image")
  @Post("create")
  create(
    @Body() dto: CreateCompanyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.logo = "uploads/1769117418161-255385753.svg"; // or save full path if you want
    }

    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("getAll")
  findAll(
    @Query("page") page?: number,
    @Query("size") size?: number,
    @Query("companyType") companyType?: string,
    @Query("insuranceType") insuranceType?: string,
    @Query("search") search?: string,
  ) {
    return this.service.findAll({
      page: Number(page),
      size: Number(size),
      companyType,
      insuranceType,
      search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.service.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @UploadImageInterceptor("image")
  @Patch(":id")
  update(
    @Param("id") id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCompanyDto,
  ) {
    if (file) {
      dto.logo = "uploads/" + file.filename; // or save full path if you want
    }
    return this.service.update(+id, dto);
  }

  //   @UseGuards(JwtAuthGuard)
  @Patch(":companyId/plans/:planId")
  updatePlan(
    @Param("companyId") companyId: number,
    @Param("planId") planId: number,
    @Body() dto: UpdateCompanyPlanDto,
  ) {
    return this.service.updatePlanFeatures(+companyId, +planId, dto);
  }

  //   @UseGuards(JwtAuthGuard)
  @Delete(":companyId/plans/:planId")
  deletePlan(
    @Param("companyId") companyId: number,
    @Param("planId") planId: number,
  ) {
    return this.service.deletePlan(+companyId, +planId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.service.remove(+id);
  }
}
