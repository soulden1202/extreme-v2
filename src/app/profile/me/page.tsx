import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ProfileMePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) {
    // Edge case: User exists in Clerk but not DB (hasn't performed action yet)
    // Send to home or an onboarding page
    redirect("/");
  }

  redirect(`/profile/${dbUser.id}`);
}
