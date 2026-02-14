
"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getMyProfileId() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: {
        id: true
    }
  });

  return dbUser?.id || null;
}
