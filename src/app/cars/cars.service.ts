import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateCarFullDto,
  CreateCarMakeDto,
  CreateCarModelDto,
  CreateCarYearDto,
  GetCarsDto,
  UpdateCarFullDto,
} from "./car.dto";
import { Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  normalizeName(value: string) {
    return value.trim().toLowerCase();
  }

  // ---------------- Make ----------------
  async createMake(dto: CreateCarMakeDto) {
    const normalized = this.normalizeName(dto.name);

    const exists = await this.prisma.carMake.findUnique({
      where: { normalizedName: normalized },
    });

    if (exists) {
      throw new BadRequestException("Car make already exists");
    }

    return this.prisma.carMake.create({
      data: {
        name: dto.name.trim(),
        normalizedName: normalized,
      },
    });
  }

  // ---------------- Model ----------------
  async createModel(dto: CreateCarModelDto) {
    const make = await this.prisma.carMake.findUnique({
      where: { id: dto.makeId },
    });

    if (!make) throw new NotFoundException("Car make not found");

    const normalized = this.normalizeName(dto.name);

    const exists = await this.prisma.carModel.findFirst({
      where: {
        normalizedName: normalized,
        makeId: dto.makeId,
      },
    });

    if (exists) {
      throw new BadRequestException("Car model already exists for this make");
    }

    return this.prisma.carModel.create({
      data: {
        name: dto.name.trim(),
        normalizedName: normalized,
        makeId: dto.makeId,
      },
    });
  }

  // ---------------- Year ----------------
  async createYear(dto: CreateCarYearDto) {
    const model = await this.prisma.carModel.findUnique({
      where: { id: dto.modelId },
    });

    if (!model) {
      throw new NotFoundException("Car model not found");
    }

    const exists = await this.prisma.carYear.findFirst({
      where: {
        year: dto.year,
        modelId: dto.modelId,
      },
    });

    if (exists) {
      throw new BadRequestException("Car year already exists for this model");
    }

    return this.prisma.carYear.create({
      data: {
        year: dto.year,
        modelId: dto.modelId,
        minimumPrice: dto.minimumPrice,
      },
    });
  }

  // ---------------- Full Create ----------------
  async createCarFull(dto: CreateCarFullDto) {
    const normalized = this.normalizeName(dto.make);
    const normalizedModel = this.normalizeName(dto.model);
    // 1️⃣ Make
    const make =
      (await this.prisma.carMake.findUnique({
        where: { normalizedName: normalized },
      })) ??
      (await this.prisma.carMake.create({
        data: { name: dto.make.trim(), normalizedName: normalized },
      }));

    // 2️⃣ Model
    const model =
      (await this.prisma.carModel.findFirst({
        where: {
          normalizedName: normalizedModel,
          makeId: make.id,
        },
      })) ??
      (await this.prisma.carModel.create({
        data: {
          name: dto.model.trim(),
          makeId: make.id,
          normalizedName: normalizedModel,
        },
      }));

    // 3️⃣ Year (STRICT)
    const yearExists = await this.prisma.carYear.findFirst({
      where: {
        year: dto.year,
        modelId: model.id,
      },
    });

    if (yearExists) {
      throw new BadRequestException(
        "Car with same make, model and year already exists",
      );
    }

    return this.prisma.carYear.create({
      data: {
        year: dto.year,
        modelId: model.id,
        minimumPrice: dto.minimumPrice,
      },
    });
  }

  // ---------------- Get Cars ----------------
  async getCars(query: GetCarsDto) {
    const { make, model, year, page = 1, size = 10 } = query;

    const where: Prisma.CarYearWhereInput = {
      ...(year && { year }),
      model: {
        ...(model && {
          name: {
            contains: model,
            mode: Prisma.QueryMode.insensitive,
          },
        }),
        ...(make && {
          make: {
            name: {
              contains: make,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        }),
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.carYear.findMany({
        where,
        include: {
          model: {
            include: {
              make: true,
            },
          },
        },
        skip: (page - 1) * size,
        take: size,
        orderBy: { year: "desc" },
      }),
      this.prisma.carYear.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        size,
        pages: Math.ceil(total / size),
      },
    };
  }

  async bulkUpload(file: Express.Multer.File) {
    let rows: {
      brand: string;
      carmodel: string;
      year: number;
      price: number;
    }[] = [];

    // ---------- Parse ----------
    if (file.originalname.endsWith(".csv")) {
      rows = parse(file.buffer, { columns: true, skip_empty_lines: true });
    } else if (file.originalname.endsWith(".xlsx")) {
      const workbook = XLSX.read(file.buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    } else {
      throw new BadRequestException("Unsupported file type");
    }

    const errors: {
      row: number;
      reason: string;
      data: any;
    }[] = [];

    const seen = new Set<string>(); // 🔥 detect duplicates in file

    let success = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // Excel row (header = row 1)
      const row = rows[i];

      try {
        const makeName = row.brand?.trim();
        const modelName = row.carmodel?.toString().trim();
        const year = Number(row.year);
        const price = Number(row.price) || 0;

        if (!makeName || !modelName || !year) {
          throw new Error("Missing required fields");
        }

        const makeKey = this.normalizeName(makeName);
        const modelKey = this.normalizeName(modelName);

        const dedupeKey = `${makeKey}|${modelKey}|${year}`;

        // 🔒 Duplicate inside file
        if (seen.has(dedupeKey)) {
          throw new Error("Duplicate row in file");
        }

        seen.add(dedupeKey);

        // ---------- Make ----------
        const make = await this.prisma.carMake.upsert({
          where: { normalizedName: makeKey },
          update: { name: makeName },
          create: {
            name: makeName,
            normalizedName: makeKey,
          },
        });

        // ---------- Model ----------
        const model =
          (await this.prisma.carModel.findFirst({
            where: {
              normalizedName: modelKey,
              makeId: make.id,
            },
          })) ??
          (await this.prisma.carModel.create({
            data: {
              name: modelName,
              normalizedName: modelKey,
              makeId: make.id,
            },
          }));

        // ---------- Year ----------
        await this.prisma.carYear.upsert({
          where: {
            year_modelId: {
              year,
              modelId: model.id,
            },
          },
          update: {
            minimumPrice: price,
          },
          create: {
            year,
            modelId: model.id,
            minimumPrice: price,
          },
        });

        success++;
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          reason: err.message || "Unknown error",
          data: row,
        });
      }
    }

    return {
      totalRows: rows.length,
      insertedOrUpdated: success,
      failed: errors.length,
      errors,
    };
  }

  async getAllMakes() {
    return this.prisma.carMake.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getModelsByMake(makeId: number) {
    const make = await this.prisma.carMake.findUnique({
      where: { id: makeId },
    });

    if (!make) {
      throw new NotFoundException("Car make not found");
    }

    return this.prisma.carModel.findMany({
      where: { makeId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getYearsByModel(modelId: number) {
    const model = await this.prisma.carModel.findUnique({
      where: { id: modelId },
    });

    if (!model) {
      throw new NotFoundException("Car model not found");
    }

    return this.prisma.carYear.findMany({
      where: { modelId },
      orderBy: { year: "desc" },
      select: {
        id: true,
        year: true,
        minimumPrice: true,
      },
    });
  }

  async getOne(id: number) {
    const car = await this.prisma.carYear.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException("Car not found");
    }

    return car;
  }

  async updateFull(id: number, dto: UpdateCarFullDto) {
    const car = await this.prisma.carYear.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException("Car not found");
    }

    // 1️⃣ Make
    let make = car.model.make;
    if (dto.make) {
      const normalizedMake = this.normalizeName(dto.make);
      make =
        (await this.prisma.carMake.findUnique({
          where: { normalizedName: normalizedMake },
        })) ??
        (await this.prisma.carMake.create({
          data: {
            name: dto.make.trim(),
            normalizedName: normalizedMake,
          },
        }));
    }

    // 2️⃣ Model
    let modelEntity = car.model as {
      id: number;
      name: string;
      normalizedName: string;
      makeId: number;
    };

    if (dto.model || dto.make) {
      const normalizedModel = this.normalizeName(dto.model ?? modelEntity.name);

      modelEntity =
        (await this.prisma.carModel.findFirst({
          where: {
            normalizedName: normalizedModel,
            makeId: make.id,
          },
        })) ??
        (await this.prisma.carModel.create({
          data: {
            name: dto.model?.trim() ?? modelEntity.name,
            normalizedName: normalizedModel,
            makeId: make.id,
          },
        }));
    }

    // 3️⃣ Year
    const newYear = dto.year ?? car.year;

    const duplicate = await this.prisma.carYear.findFirst({
      where: {
        year: newYear,
        modelId: modelEntity.id,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        "Another car already exists with same make, model and year",
      );
    }

    return this.prisma.carYear.update({
      where: { id },
      data: {
        year: newYear,
        modelId: modelEntity.id,
        minimumPrice: dto.minimumPrice,
      },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
    });
  }

  async deleteFull(id: number) {
    const car = await this.prisma.carYear.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException("Car not found");
    }

    // delete year
    await this.prisma.carYear.delete({
      where: { id },
    });

    // cleanup model if unused
    const modelCount = await this.prisma.carYear.count({
      where: { modelId: car.modelId },
    });

    if (modelCount === 0) {
      await this.prisma.carModel.delete({
        where: { id: car.modelId },
      });

      // cleanup make if unused
      const makeCount = await this.prisma.carModel.count({
        where: { makeId: car.model.makeId },
      });

      if (makeCount === 0) {
        await this.prisma.carMake.delete({
          where: { id: car.model.makeId },
        });
      }
    }

    return { message: "Car deleted successfully" };
  }
}
