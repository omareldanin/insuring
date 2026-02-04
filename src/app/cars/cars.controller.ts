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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  CreateCarFullDto,
  CreateCarMakeDto,
  CreateCarModelDto,
  CreateCarYearDto,
  GetCarsDto,
  UpdateCarFullDto,
} from "./car.dto";
import { CarsService } from "./cars.service";
import { JwtAuthGuard } from "src/middlewares/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("cars")
export class CarsController {
  constructor(private service: CarsService) {}

  // ---------- Admin ----------
  @UseGuards(JwtAuthGuard)
  @Post("make")
  createMake(@Body() dto: CreateCarMakeDto) {
    return this.service.createMake(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("model")
  createModel(@Body() dto: CreateCarModelDto) {
    return this.service.createModel(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("year")
  createYear(@Body() dto: CreateCarYearDto) {
    return this.service.createYear(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("full")
  createCarFull(@Body() dto: CreateCarFullDto) {
    return this.service.createCarFull(dto);
  }

  // ---------- Public ----------
  // @UseGuards(JwtAuthGuard)
  @Get("getAll")
  getCars(@Query() query: GetCarsDto) {
    return this.service.getCars(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadCars(@UploadedFile() file: Express.Multer.File) {
    return this.service.bulkUpload(file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  updateFull(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCarFullDto,
  ) {
    return this.service.updateFull(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  deleteFull(@Param("id", ParseIntPipe) id: number) {
    return this.service.deleteFull(id);
  }

  @Get("makes")
  getAllMakes() {
    return this.service.getAllMakes();
  }

  @Get("models/:makeId")
  getModelsByMake(@Param("makeId", ParseIntPipe) makeId: number) {
    return this.service.getModelsByMake(makeId);
  }

  @Get("years/:modelId")
  getYearsByModel(@Param("modelId", ParseIntPipe) modelId: number) {
    return this.service.getYearsByModel(modelId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.getOne(id);
  }
}
