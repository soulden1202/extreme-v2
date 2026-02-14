"use server";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function incrementView(videoId: string) {
  console.log(`[ServerAction] incrementView called for ${videoId}`);
  try {
      // Atomic increment
      await db.update(videos)
        .set({
            views: sql`${videos.views} + 1`
        })
        .where(eq(videos.id, videoId));
      console.log(`[ServerAction] Successfully incremented view for ${videoId}`);
  } catch (error) {
    console.error(`[ServerAction] Error incrementing view for ${videoId}:`, error);
    throw error;
  }
}
