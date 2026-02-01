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
    CarsModule,
    CompanyModule,
    RulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
