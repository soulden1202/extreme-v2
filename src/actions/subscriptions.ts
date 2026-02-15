
"use server";

import { db } from "@/db";
import { subscriptions, users, notifications } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Toggles subscription status for the current user and the target user.
 * If already subscribed, un-subscribes. If not, subscribes.
 * Returns the new status (true = subscribed, false = unsubscribed).
 */
export async function toggleSubscription(followingId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  // Get our internal user ID
  const follower = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!follower) {
    throw new Error("User not found");
  }

  const followerId = follower.id;

  if (followerId === followingId) {
    throw new Error("Cannot subscribe to yourself");
  }

  // Check if subscription exists
  const existing = await db.query.subscriptions.findFirst({
    where: and(
        eq(subscriptions.followerId, followerId),
        eq(subscriptions.followingId, followingId)
    ),
  });

  if (existing) {
    // Unsubscribe
    await db.delete(subscriptions).where(
        and(
            eq(subscriptions.followerId, followerId),
            eq(subscriptions.followingId, followingId)
        )
    );
    return false;
  } else {
    // Subscribe
    await db.insert(subscriptions).values({
        followerId,
        followingId,
    });

    // Create notification
    await db.insert(notifications).values({
        recipientId: followingId,
        actorId: followerId,
        type: "FOLLOW",
        resourceId: followerId, // resource for follow is the follower user
        isRead: false,
    });
    
    return true;
  }
}

/**
 * Checks if the current user is subscribed to the target user.
 */
export async function getSubscriptionStatus(followingId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return false;
  }

  // Get our internal user ID
  const follower = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true }
  });

  if (!follower) {
    return false;
  }

  const existing = await db.query.subscriptions.findFirst({
    where: and(
        eq(subscriptions.followerId, follower.id),
        eq(subscriptions.followingId, followingId)
    ),
  });

  return !!existing;
}

/**
 * Gets the number of subscribers for a user.
 */
export async function getSubscriberCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(eq(subscriptions.followingId, userId));
    
  return result[0].count;
}
