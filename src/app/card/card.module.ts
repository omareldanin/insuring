import { Module } from "@nestjs/common";
import { DiscountCardController } from "./card.controller";
import { DiscountCardService } from "./card.service";

@Module({
  controllers: [DiscountCardController],
  providers: [DiscountCardService],
})
export class CardModule {}
