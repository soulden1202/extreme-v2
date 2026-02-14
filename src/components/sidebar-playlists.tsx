
"use client";

import { useEffect, useState } from "react";
import { getUserPlaylists } from "@/actions/playlists";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ListMusic, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Playlist {
  id: string;
  name: string;
}

export function SidebarPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("Failed to fetch playlists", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          {/* Render simple label if loading or empty, otherwise trigger */}
            <CollapsibleTrigger>
              Playlists
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
        </SidebarGroupLabel>

        {/* Use Force Mount or conditional rendering inside Content to maintain structure */}
        <CollapsibleContent forceMount>
             <SidebarGroupContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                       <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                ) : playlists.length === 0 ? (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/playlists">
                                    <ListMusic />
                                    <span>All Playlists</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                ) : (
                    <div className={isOpen ? "block" : "hidden"}>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/playlists"}>
                                    <Link href="/playlists">
                                        <ListMusic />
                                        <span>All Playlists</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/playlists/liked"}>
                                    <Link href="/playlists/liked">
                                        <ListMusic className="text-red-500" />
                                        <span>Liked Videos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {playlists.map((playlist) => (
                                <SidebarMenuItem key={playlist.id}>
                                <SidebarMenuButton asChild isActive={pathname === `/playlists/${playlist.id}`}>
                                    <Link href={`/playlists/${playlist.id}`}>
                                    <ListMusic className="opacity-70" />
                                    <span>{playlist.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                )}
             </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
