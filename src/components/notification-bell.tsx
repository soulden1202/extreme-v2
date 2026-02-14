"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUnreadNotificationCount, getNotifications, markAllNotificationsAsRead } from "@/actions/notifications";
import { NotificationList } from "@/components/notification-list";
import { usePathname } from "next/navigation";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Poll for unread count
  useEffect(() => {
    const fetchCount = async () => {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch (e) {
            // Ignore auth errors, just don't show count
        }
    };

    fetchCount(); // Initial
    const interval = setInterval(fetchCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [pathname]); // Also refresh on navigation

  const handleOpenchange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
        // Optimistically clear badge
        setUnreadCount(0);
        markAllNotificationsAsRead();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenchange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
