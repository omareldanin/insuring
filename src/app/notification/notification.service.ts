import { Injectable, NotFoundException } from "@nestjs/common";
import { Notification, UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import admin from "firebase-admin";
import { env } from "src/config";
import { sendOffersTemplate } from "./helper/sendMessages";
import { SendBroadcastDto } from "./notification.dto";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  }),
});

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(data: {
    title: string;
    content: string;
    userId?: number | undefined;
  }) {
    let tokens: string[] = [];
    let ids: number[] = [];

    const user = await this.prisma.user.findUnique({
      where: { id: +data.userId },
      select: { id: true, fcm: true, phone: true },
    });

    if (user) {
      ids = [user.id];
      tokens = user.fcm;
    }

    if (tokens.length > 0) {
      const response = await admin.messaging().sendEachForMulticast({
        notification: { title: data.title, body: data.content },
        tokens,
      });

      // log كل النتائج
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          console.warn(
            `❌ Failed to send notification to token ${tokens[idx]}:`,
            res.error?.message,
          );
        }
      });
    }

    // save notifications في DB حتى لو حصل errors
    const results = await this.prisma.notification.createMany({
      data: ids.map((id) => ({
        title: data.title,
        content: data.content,
        userId: id,
      })),
    });

    return { message: "success", results };
  }

  async getUserNotifications(data: {
    page: number;
    size: number;
    userId: number;
    role: UserRole;
  }): Promise<{
    count: number;
    page: number;
    totalPages: number;
    results: Notification[];
  }> {
    const page = +data.page || 1;
    const pageSize = +data.size || 20;

    const [results, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          userId: data.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * +pageSize,
        take: +pageSize,
      }),
      this.prisma.notification.count({
        where: {
          userId: data.userId,
        },
      }),
    ]);

    return {
      count: total,
      page,
      totalPages: Math.ceil(total / pageSize),
      results: results,
    };
  }
  async updateNotificationSeen(data: { id: number }): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!notification) {
      throw new NotFoundException("notification not found");
    }
    return await this.prisma.notification.update({
      where: {
        id: data.id,
      },
      data: {
        seen: true,
      },
    });
  }
  async updateUserNotificationsSeen(data: {
    userId: number;
  }): Promise<{ message: string }> {
    await this.prisma.notification.updateMany({
      where: {
        userId: data.userId,
        seen: false,
      },
      data: {
        seen: true,
      },
    });
    return { message: "success" };
  }

  async sendNotificationToAll(data: SendBroadcastDto) {
    const isWhatsApp = data.type === "whatsapp";

    if (
      isWhatsApp &&
      (!process.env.WA_PHONE_NUMBER_ID || !process.env.WA_TOKEN)
    ) {
      throw new Error("WhatsApp configuration is missing");
    }

    const matchedUsers = await this.prisma.user.findMany({
      where: {
        ...(data.userIds !== undefined ? { id: { in: data.userIds } } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(isWhatsApp ? {} : { fcm: { isEmpty: false } }),
      },
      select: {
        id: true,
        fcm: true,
        phone: true,
      },
    });

    const users = isWhatsApp
      ? matchedUsers.filter((user) => Boolean(user.phone?.trim()))
      : matchedUsers;

    let successCount = 0;
    let failureCount = 0;

    if (isWhatsApp) {
      // Limit concurrent requests. Each recipient gets a separate API call.
      const batchSize = 10;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        const outcomes = await Promise.allSettled(
          batch.map((user) => sendOffersTemplate(user.phone!, data.content)),
        );

        outcomes.forEach((outcome, index) => {
          if (outcome.status === "fulfilled") {
            successCount++;
          } else {
            failureCount++;

            console.warn(
              `WhatsApp request failed for user ${batch[index].id}:`,
              outcome.reason instanceof Error
                ? outcome.reason.message
                : "Unknown error",
            );
          }
        });
      }
    } else {
      const tokens = users.flatMap((user) => user.fcm);

      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);

        try {
          const response = await admin.messaging().sendEachForMulticast({
            notification: {
              title: data.title,
              body: data.content,
            },
            tokens: batch,
          });

          successCount += response.successCount;
          failureCount += response.failureCount;

          response.responses.forEach((result, index) => {
            if (!result.success) {
              console.warn(
                `FCM request failed at batch index ${index}:`,
                result.error?.message,
              );
            }
          });
        } catch (error) {
          failureCount += batch.length;

          console.warn(
            "FCM batch failed:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      }
    }

    // Preserve your existing behavior: save for all targeted users,
    // including users whose external message request failed.
    const saved = users.length
      ? (
          await this.prisma.notification.createMany({
            data: users.map((user) => ({
              title: data.title,
              content: data.content,
              userId: user.id,
            })),
          })
        ).count
      : 0;

    return {
      message:
        failureCount === 0
          ? "success"
          : successCount === 0
            ? "failed"
            : "partial_success",
      channel: isWhatsApp ? "whatsapp" : "push",
      sentTo: users.length,
      skippedCount: matchedUsers.length - users.length,
      successCount,
      failureCount,
      saved,
    };
  }
}
