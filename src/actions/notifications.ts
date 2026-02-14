"use server";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
// import { currentUser } from "@clerk/nextjs/server"; // Not needed if using getDbUser
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/auth-utils";

export async function getNotifications() {
  const dbUser = await getDbUser();
  if (!dbUser) return [];

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.recipientId, dbUser.id),
    orderBy: [desc(notifications.createdAt)],
    with: {
        actor: true, // sender
    },
    limit: 20,
  });

  return userNotifications;
}

export async function getUnreadNotificationCount() {
    const dbUser = await getDbUser();
    if (!dbUser) return 0;
  
    const unread = await db.query.notifications.findMany({
        where: and(
            eq(notifications.recipientId, dbUser.id),
            eq(notifications.isRead, false)
        ),
    });

    return unread.length;
}

export async function markNotificationAsRead(notificationId: string) {
    const dbUser = await getDbUser();
    if (!dbUser) throw new Error("Unauthorized");

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
    
    // revalidatePath is probably not needed for global laytout unless we want to clear badge immediately
    revalidatePath("/"); 
}

export async function markAllNotificationsAsRead() {
    const dbUser = await getDbUser();
    if (!dbUser) throw new Error("Unauthorized");

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.recipientId, dbUser.id));

    revalidatePath("/");
}

// Internal helper to create notification
export async function createNotification(
    recipientId: string, 
    actorId: string, 
    type: "LIKE_VIDEO" | "COMMENT" | "REPLY" | "FOLLOW",
    resourceId: string
) {
    if (recipientId === actorId) return; // Don't notify self

    await db.insert(notifications).values({
        recipientId,
        actorId,
        type,
        resourceId,
    });
}
