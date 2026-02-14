"use server";

import { db } from "@/db";
import { likes, users, videos, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/auth-utils";

export async function toggleLike(videoId: string) {
  const dbUser = await getDbUser();

  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  const existingLike = await db.query.likes.findFirst({
    where: and(
        eq(likes.userId, dbUser.id),
        eq(likes.videoId, videoId)
    ),
  });

  if (existingLike) {
    await db.delete(likes).where(and(
        eq(likes.userId, dbUser.id),
        eq(likes.videoId, videoId)
    ));
  } else {
    await db.insert(likes).values({
        userId: dbUser.id,
        videoId: videoId,
    });

    // Notify video owner
    try {
        const video = await db.query.videos.findFirst({
            where: eq(videos.id, videoId),
        });
        
        if (video && video.userId !== dbUser.id) {
            await db.insert(notifications).values({
                recipientId: video.userId,
                actorId: dbUser.id,
                type: "LIKE_VIDEO",
                resourceId: videoId,
            });
        }
    } catch (error) {
        console.error("Failed to send notification", error);
    }
  }

  revalidatePath(`/watch/${videoId}`);
}
