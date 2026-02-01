import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateCarMakeDto {
  @IsString()
  name: string;
}

export class CreateCarModelDto {
  @IsString()
  name: string;

  @IsInt()
  makeId: number;
}

export class CreateCarYearDto {
  @IsInt()
  @Min(1900)
  year: number;

  @IsInt()
  modelId: number;

  @IsInt()
  minimumPrice: number;
}

export class CreateCarFullDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsInt()
  @Min(1900)
  year: number;

  @IsInt()
  minimumPrice: number;
}

export class GetCarsDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number = 10;
}

export class UpdateCarFullDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  minimumPrice?: number;
}
