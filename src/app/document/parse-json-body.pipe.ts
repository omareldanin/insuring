import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateDocumentDto } from "./update-document.dto";

@Injectable()
export class ParseDocumentDataPipe implements PipeTransform {
  async transform(value: string): Promise<UpdateDocumentDto> {
    if (!value) throw new BadRequestException("حقل data مفقود");
    let parsed: any;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new BadRequestException("صيغة data غير صحيحة");
    }

    const dto = plainToInstance(UpdateDocumentDto, parsed);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) throw new BadRequestException(errors);

    return dto;
  }
}
