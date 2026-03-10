// import { Injectable } from "@nestjs/common";
// import { Cron } from "@nestjs/schedule";
// import { PrismaService } from "src/prisma/prisma.service";

// @Injectable()
// export class DocumentReminderService {
//   constructor(private prisma: PrismaService) {}

//   @Cron("0 2 * * *") // runs daily at 2AM
//   async checkDocumentExpiration() {
//     const today = new Date();

//     const days60 = new Date();
//     days60.setDate(today.getDate() + 60);

//     const days45 = new Date();
//     days45.setDate(today.getDate() + 45);

//     const days15 = new Date();
//     days15.setDate(today.getDate() + 15);

//     const documents = await this.prisma.insuranceDocument.findMany({
//       where: {
//         endDate: {
//           not: null,
//         },
//       },
//       include: {
//         user: true,
//       },
//     });

//     for (const doc of documents) {
//       if (!doc.endDate) continue;

//       const diffDays = Math.ceil(
//         (doc.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
//       );

//       if ([60, 45, 15].includes(diffDays)) {
//         await this.createNotification(doc.userId, doc.id, diffDays);
//       }
//     }
//   }

//   async createNotification(userId: number, documentId: number, days: number) {
//     await this.prisma.notification.create({
//       data: {
//         userId,
//         title: "Insurance Expiration Reminder",
//         body: `Your insurance document #${documentId} will expire in ${days} days`,
//       },
//     });
//   }
// }
