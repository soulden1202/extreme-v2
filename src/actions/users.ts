"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { getDbUser } from "@/lib/auth-utils";

export async function searchUsers(query: string) {
  const dbUser = await getDbUser();
  if (!dbUser) return [];

  if (!query || query.length < 2) return [];

  const results = await db.query.users.findMany({
    where: ilike(users.name, `%${query}%`),
    limit: 5,
  });

  return results.map(u => ({
    id: u.id,
    name: u.name,
    imageUrl: u.imageUrl,
  }));
}
