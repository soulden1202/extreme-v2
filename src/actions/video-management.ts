"use server";

import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/auth-utils";

export async function updateVideo(videoId: string, formData: FormData) {
  const dbUser = await getDbUser();

  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tagsString = formData.get("tags") as string; 
  
  // Parse tags: split by comma, trim whitespace, filter empty
  const tags = tagsString 
    ? tagsString.split(",").map(t => t.trim()).filter(t => t.length > 0) 
    : [];

  // Verify ownership
  const video = await db.query.videos.findFirst({
    where: and(
        eq(videos.id, videoId),
        eq(videos.userId, dbUser.id)
    )
  });

  if (!video) {
    throw new Error("Video not found or unauthorized");
  }

  await db.update(videos)
    .set({
        title,
        description,
        tags, 
        updatedAt: new Date(),
    })
    .where(eq(videos.id, videoId));

  revalidatePath("/dashboard");
  revalidatePath(`/watch/${videoId}`);
  revalidatePath(`/profile/${dbUser.id}`);
}

export async function deleteVideo(videoId: string) {
    const dbUser = await getDbUser();
  
    if (!dbUser) {
      throw new Error("Unauthorized");
    }
  
    // Verify ownership
    const video = await db.query.videos.findFirst({
      where: and(
          eq(videos.id, videoId),
          eq(videos.userId, dbUser.id)
      )
    });
  
    if (!video) {
      throw new Error("Video not found or unauthorized");
    }
  
    await db.delete(videos).where(eq(videos.id, videoId));
  
    revalidatePath("/dashboard");
    revalidatePath(`/profile/${dbUser.id}`);
    revalidatePath("/");
  }
