import { applyDecorators, UseInterceptors } from "@nestjs/common";
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

export function UploadImageInterceptor(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: diskStorage({
          destination: "./uploads",
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
      }),
    ),
  );
}

export function UploadMembersInterceptor(folder = "members") {
  return applyDecorators(
    UseInterceptors(
      AnyFilesInterceptor({
        storage: diskStorage({
          destination: `./uploads/${folder}`,
          filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, unique + extname(file.originalname));
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
      }),
    ),
  );
}

export function UploadFieldsInterceptor(
  fields: { name: string; maxCount?: number }[],
  folder: string,
) {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(fields, {
        storage: diskStorage({
          destination: `./uploads/${folder}`,
          filename: (req, file, cb) => {
            const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

            cb(null, unique + extname(file.originalname));
          },
        }),
      }),
    ),
  );
}
