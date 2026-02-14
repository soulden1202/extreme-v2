"use client"

import { Home, TrendingUp, Upload, User, Video, LogOut, LayoutDashboard, ListMusic } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import { NotificationBell } from "@/components/notification-bell"

import { SidebarPlaylists } from "@/components/sidebar-playlists"

// Menu items.
const discoveryItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendingUp,
  },
]

const userItems = [
  {
    title: "Upload",
    url: "/upload",
    icon: Upload,
  },
  {
    title: "Profile",
    url: "/profile/me",
    icon: User,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
]


import { getMyProfileId } from "@/actions/user"
import { useEffect, useState } from "react"

export function AppSidebar() {
  const pathname = usePathname()
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileId = async () => {
        try {
            const id = await getMyProfileId()
            setProfileId(id)
        } catch (error) {
            console.error("Failed to fetch profile ID", error)
        }
    }
    fetchProfileId()
  }, [])

  return (

    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border flex flex-row items-center justify-between">
         <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <Video className="w-8 h-8" />
            <span>Extreme</span>
         </Link>
         <NotificationBell />
      </SidebarHeader>
      <SidebarContent>
        {/* Discovery Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Discovery</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {discoveryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Playlists Group (Collapsible) */}
        <SidebarPlaylists />

        {/* User Group */}
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => {
                 // Dynamic link for Profile
                 const url = item.title === "Profile" && profileId 
                    ? `/profile/${profileId}` 
                    : item.url;
                 
                 return (
                    <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === url || (item.title === "Profile" && pathname.startsWith("/profile/"))}>
                        <Link href={url}>
                        <item.icon />
                        <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                 )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
             <UserButton afterSignOutUrl="/" />
             <div className="text-xs text-muted-foreground">
                <p>Signed in</p>
             </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  )
}

