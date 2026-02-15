
"use server";

import { db } from "@/db";
import { watchHistory, videos, users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, lt, sql } from "drizzle-orm";

/**
 * Logs a video view to history.
 * - Upserts: updates timestamp if already exists.
 * - Prunes: removes entries older than 30 days.
 */
export async function logWatchHistory(videoId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) return;

  // Get internal user ID
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true }
  });

  if (!dbUser) return;

  // 1. Upsert History Record
  // Drizzle upsert syntax
  await db.insert(watchHistory)
    .values({
        userId: dbUser.id,
        videoId: videoId,
        watchedAt: new Date(),
    })
    .onConflictDoUpdate({
        target: [watchHistory.userId, watchHistory.videoId],
        set: { watchedAt: new Date() }
    });

  // 2. Prune Old Records (Async-ish)
  // Clean up records older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // We don't await this to keep response fast, or we can await it. 
  // For safety in serverless, we should await or use logic to skip often.
  // Let's await for now to ensure consistency.
  await db.delete(watchHistory)
    .where(
        and(
            eq(watchHistory.userId, dbUser.id),
            lt(watchHistory.watchedAt, thirtyDaysAgo)
        )
    );
}

/**
 * Fetches the user's watch history.
 */
export async function getWatchHistory() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return [];

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true }
  });

  if (!dbUser) return [];

  const history = await db.query.watchHistory.findMany({
    where: eq(watchHistory.userId, dbUser.id),
    with: {
        video: {
            with: {
                user: true // video creator
            }
        }
    },
    orderBy: [desc(watchHistory.watchedAt)],
    limit: 50
  });

  return history;
}

/**
 * Clears entire history for the user.
 */
export async function clearWatchHistory() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true }
  });

  if (!dbUser) return;

  await db.delete(watchHistory).where(eq(watchHistory.userId, dbUser.id));
}
