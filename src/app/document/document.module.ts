import { Module } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentController } from "./document.controller";
import { NotificationModule } from "../notification/notification.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [NotificationModule, EmailModule],
  providers: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule {}
