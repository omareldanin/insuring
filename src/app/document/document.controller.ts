import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import {
  UploadFieldsInterceptor,
  UploadMembersInterceptor,
} from "src/middlewares/file-upload.interceptor";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { LoggedInUserType } from "../auth/auth.dto";
import {
  createCarDocumentDto,
  CreateGroupHealthDocDto,
  createHealthDocumentDto,
  createLifeDocumentDto,
} from "./document.dto";
import { InsuranceTypeEnum } from "@prisma/client";

@Controller("document")
export class DocumentController {
  constructor(private readonly service: DocumentService) {}
  private parseMembers(
    body: any,
    files: Express.Multer.File[],
    folder = "health",
  ): CreateGroupHealthDocDto {
    const members: any[] = [];

    let companyTaxRegister: string | undefined;
    let companyCommercialRegister: string | undefined;

    // ✅ extract members safely
    if (Array.isArray(body.members)) {
      body.members.forEach((member, index) => {
        members[index] = {
          age: Number(member.age),
          gender: member.gender,
        };
      });
    } else {
      Object.keys(body).forEach((key) => {
        const match = key.match(/^members\[(\d+)]\[(\w+)]$/);
        if (!match) return;

        const index = Number(match[1]);
        const field = match[2];

        if (!members[index]) members[index] = {};

        members[index][field] = field === "age" ? Number(body[key]) : body[key];
      });
    }

    // ✅ attach files
    for (const file of files) {
      if (file.fieldname === "companyTaxRegister") {
        companyTaxRegister = `uploads/${folder}/${file.filename}`;
        continue;
      }

      if (file.fieldname === "companyCommercialRegister") {
        companyCommercialRegister = `uploads/${folder}/${file.filename}`;
        continue;
      }

      const match = file.fieldname.match(/^members\[(\d+)]\[(\w+)]$/);
      if (!match) continue;

      const index = Number(match[1]);
      const field = match[2];

      if (!members[index]) members[index] = {};

      members[index][field] = `uploads/${folder}/${file.filename}`;
    }
    const normalizedMembers = members.filter(Boolean);

    return {
      planId: Number(body.planId),
      companyId: Number(body.companyId),
      type: body.type,
      paidKey: body.paidKey,

      groupName: body.groupName ?? null,
      companyTaxRegister,
      companyCommercialRegister,

      members: normalizedMembers,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("health/group")
  @UploadMembersInterceptor("health")
  async createGroupHealth(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    const dto = this.parseMembers(body, files);

    return this.service.createManyHealthDocument(dto, loggedInUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("car")
  @UploadFieldsInterceptor(
    [
      { name: "idFile", maxCount: 1 },
      { name: "driveLicenseFile", maxCount: 1 },
      { name: "carLicenseFile", maxCount: 1 },
    ],
    "car",
  )
  async createCarDocument(
    @Body() body: createCarDocumentDto,
    @UploadedFiles()
    files: {
      idFile?: Express.Multer.File[];
      driveLicenseFile?: Express.Multer.File[];
      carLicenseFile?: Express.Multer.File[];
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    body.idFile = files.idFile?.[0]
      ? `uploads/car/${files.idFile[0].filename}`
      : undefined;

    body.driveLicenseFile = files.driveLicenseFile?.[0]
      ? `uploads/car/${files.driveLicenseFile[0].filename}`
      : undefined;

    body.carLicenseFile = files.carLicenseFile?.[0]
      ? `uploads/car/${files.carLicenseFile[0].filename}`
      : undefined;

    return this.service.createCarDocument(body, loggedInUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("life")
  @UploadFieldsInterceptor([{ name: "idFile", maxCount: 1 }], "life")
  async createLifeDocument(
    @Body() body: createLifeDocumentDto,
    @UploadedFiles()
    files: {
      idFile?: Express.Multer.File[];
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    body.idFile = files.idFile?.[0]
      ? `uploads/life/${files.idFile[0].filename}`
      : undefined;

    return this.service.createLifeDocument(body, loggedInUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("health/individual")
  @UploadFieldsInterceptor(
    [
      { name: "idFile", maxCount: 1 },
      { name: "avatar", maxCount: 1 },
    ],
    "health",
  )
  async createHealthDocument(
    @Body() body: createHealthDocumentDto,
    @UploadedFiles()
    files: {
      idFile?: Express.Multer.File[];
      avatar?: Express.Multer.File[];
    },
    @Req() req,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    body.idFile = files.idFile?.[0]
      ? `uploads/health/${files.idFile[0].filename}`
      : undefined;

    body.avatar = files.avatar?.[0]
      ? `uploads/health/${files.avatar[0].filename}`
      : undefined;

    return this.service.createIndividualHealthDocument(body, loggedInUser.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/getAll")
  async getAll(
    @Req() req,
    @Query("page") page?: string,
    @Query("size") size?: string,
    @Query("companyId") companyId?: string,
    @Query("planId") planId?: string,
    @Query("userId") userId?: string,
    @Query("confirmed") confirmed?: string,
    @Query("insuranceType") insuranceType?: InsuranceTypeEnum,
  ) {
    const loggedInUser = req.user as LoggedInUserType;

    if (loggedInUser.role !== "ADMIN") {
      userId = loggedInUser.id + "";
    }

    return this.service.getAll({
      page: page ? Number(page) : undefined,
      size: size ? Number(size) : undefined,
      companyId: companyId ? Number(companyId) : undefined,
      planId: planId ? Number(planId) : undefined,
      userId: userId ? Number(userId) : undefined,
      confirmed: confirmed !== undefined ? confirmed === "true" : undefined,
      insuranceType,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get("byDocumentNumber/:id")
  getOneByDocumentNumber(@Param("id") id: string) {
    return this.service.getOneByDocumentNumber(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() body: any) {
    return this.service.updateDocument(id, body);
  }
}
