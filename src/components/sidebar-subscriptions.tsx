
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "lucide-react";

export async function SidebarSubscriptions() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Get internal user ID
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
    columns: { id: true }
  });

  if (!dbUser) {
    return null;
  }

  const following = await db.query.subscriptions.findMany({
    where: eq(subscriptions.followerId, dbUser.id),
    with: {
        following: true // content creator user object
    },
    limit: 10 // Limit to 10 for now
  });

  if (following.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarMenu>
        {following.map((sub) => (
            <SidebarMenuItem key={sub.following.id}>
                <SidebarMenuButton asChild tooltip={sub.following.name}>
                    <Link href={`/profile/${sub.following.id}`}>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={sub.following.imageUrl} />
                            <AvatarFallback>{sub.following.name.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{sub.following.name}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
        {/* Helper link if user has many subs */}
        {/* <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link href="/subscriptions">
                    <User className="h-4 w-4" />
                    <span>All subscriptions</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
