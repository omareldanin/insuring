import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./app/auth/auth.module";
import { UsersModule } from "./app/users/users.module";
import { NotificationModule } from "./app/notification/notification.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { PlansModule } from "./app/plans/plans.module";
import { CarsModule } from "./app/cars/cars.module";
import { CompanyModule } from "./app/company/company.module";
import { RulesModule } from "./app/rules/rules.module";
import { DocumentModule } from "./app/document/document.module";
import { OffersModule } from "./app/offers/offers.module";
import { CardModule } from "./app/card/card.module";
import { EmailModule } from "./app/email/email.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads", // URL prefix
    }),
    ThrottlerModule.forRoot([
      {
        name: "otp",
        ttl: 60,
        limit: 3,
      },
    ]),
    AuthModule,
    UsersModule,
    NotificationModule,
    PlansModule,
    CompanyModule,
    RulesModule,
    DocumentModule,
    OffersModule,
    CardModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
