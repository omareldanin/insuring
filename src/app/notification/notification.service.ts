import { Injectable, NotFoundException } from "@nestjs/common";
import { Notification, UserRole } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import admin from "firebase-admin";
import { env } from "src/config";

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
      select: { id: true, fcm: true },
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
  async sendNotificationToAll(data: {
    title: string;
    content: string;
    role?: UserRole; // optional: target only a specific role
  }) {
    // 1. Get all users (optionally filtered by role) who have at least one token
    const users = await this.prisma.user.findMany({
      where: {
        ...(data.role ? { role: data.role } : {}),
        fcm: { isEmpty: false },
      },
      select: { id: true, fcm: true },
    });

    // 2. Flatten every user's tokens into one list
    const tokens = users.flatMap((u) => u.fcm);

    // 3. Send in batches of 500 (FCM multicast limit)
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);

      const response = await admin.messaging().sendEachForMulticast({
        notification: { title: data.title, body: data.content },
        tokens: batch,
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((res, idx) => {
        if (!res.success) {
          console.warn(
            `❌ Failed to send to token ${batch[idx]}:`,
            res.error?.message,
          );
        }
      });
    }

    // 4. Save one notification row per user in DB
    const results = await this.prisma.notification.createMany({
      data: users.map((u) => ({
        title: data.title,
        content: data.content,
        userId: u.id,
      })),
    });

    return {
      message: "success",
      sentTo: users.length,
      successCount,
      failureCount,
      saved: results.count,
    };
  }
}
