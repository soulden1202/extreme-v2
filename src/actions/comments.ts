"use server";

import { db } from "@/db";
import { comments, commentLikes, notifications, videos, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/auth-utils";

export async function addComment(videoId: string, text: string, parentId?: string) {
  const dbUser = await getDbUser();

  if (!dbUser) {
    throw new Error("Unauthorized");
  }

  if (!text || text.trim().length === 0) {
    return;
  }

  const [newComment] = await db.insert(comments).values({
    userId: dbUser.id,
    videoId: videoId,
    parentId: parentId || null,
    text: text.trim(),
  }).returning();

  revalidatePath(`/watch/${videoId}`);

  // trigger notification
  try {
      const mentionRegex = /@(\w+)/g;
      const mentions = text.match(mentionRegex);

      if (mentions) {
          const mentionedNames = [...new Set(mentions.map(m => m.slice(1)))]; // remove @ and unique
          
          // Find users by name (Basic implementation)
          // Ideally we would trigger notifications for each found user
          for (const name of mentionedNames) {
              const mentionedUser = await db.query.users.findFirst({
                  where: eq(users.name, name), // Case sensitive for now, or use ilike
              });

              if (mentionedUser && mentionedUser.id !== dbUser.id) {
                   await db.insert(notifications).values({
                      recipientId: mentionedUser.id,
                      actorId: dbUser.id,
                      type: "MENTION",
                      resourceId: videoId,
                  });
              }
          }
      }

      if (parentId) {
          // Notify parent comment author
          const parentComment = await db.query.comments.findFirst({
              where: eq(comments.id, parentId),
          });
          if (parentComment && parentComment.userId !== dbUser.id) {
              await db.insert(notifications).values({
                  recipientId: parentComment.userId,
                  actorId: dbUser.id,
                  type: "REPLY",
                  resourceId: videoId, // Link to video
              });
          }
      } else {
          // Notify video owner
          const video = await db.query.videos.findFirst({
              where: eq(videos.id, videoId),
          });
          if (video && video.userId !== dbUser.id) {
               await db.insert(notifications).values({
                  recipientId: video.userId,
                  actorId: dbUser.id,
                  type: "COMMENT",
                  resourceId: videoId,
              });
          }
      }
  } catch (error) {
      console.error("Failed to send notification", error);
  }
}

export async function deleteComment(commentId: string, videoId: string) {
  const dbUser = await getDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== dbUser.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath(`/watch/${videoId}`);
}

export async function toggleCommentLike(commentId: string, videoId: string) {
  const dbUser = await getDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  const existingLike = await db.query.commentLikes.findFirst({
    where: and(
        eq(commentLikes.userId, dbUser.id),
        eq(commentLikes.commentId, commentId)
    ),
  });

  if (existingLike) {
    await db.delete(commentLikes).where(eq(commentLikes.id, existingLike.id));
  } else {
    await db.insert(commentLikes).values({
        userId: dbUser.id,
        commentId,
    });
  }

  revalidatePath(`/watch/${videoId}`);
}
