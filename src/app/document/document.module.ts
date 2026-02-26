import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule {}
