import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDbUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (dbUser) {
    return dbUser;
  }

  // User doesn't exist in DB, create them
  const name = user.fullName || user.username || "User";
  const imageUrl = user.imageUrl;

  const [newUser] = await db.insert(users).values({
    clerkId: user.id,
    name,
    imageUrl,
  }).returning();

  return newUser;
}
