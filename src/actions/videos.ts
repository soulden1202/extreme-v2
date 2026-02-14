"use server";

import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createVideo(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  
  // Basic validation
  if (!title || !videoUrl || !thumbnailUrl) {
    throw new Error("Missing required fields");
  }

  // Ensure user exists in our DB (sync with Clerk)
  let dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });
  
  if (!dbUser) {
    const [newUser] = await db.insert(users).values({
        clerkId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
    }).returning();
    dbUser = newUser;
  }
  
  if (!dbUser) {
    throw new Error("Failed to create user");
  }

  const tagsString = formData.get("tags") as string;
  const tags = tagsString 
    ? tagsString.split(",").map(pager => pager.trim()).filter(Boolean)
    : [];

  await db.insert(videos).values({
    title,
    description,
    videoUrl,
    thumbnailUrl,
    tags,
    userId: dbUser.id,
  });

  revalidatePath("/");
  redirect("/");
}
