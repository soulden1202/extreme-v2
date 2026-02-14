"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Reply, UserPlus, BellOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link"; // Ensure Link is imported

interface Notification {
  id: string;
  type: "LIKE_VIDEO" | "COMMENT" | "REPLY" | "FOLLOW";
  resourceId: string;
  isRead: boolean;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
        try {
            const data = await getNotifications();
            // Need to cast because Drizzle returns Date objects which are not strictly typed in client sometimes
            setNotifications(data as unknown as Notification[]); 
        } finally {
            setIsLoading(false);
        }
    };
    fetch();
  }, []);

  const handleMarkRead = async (id: string, resourceId: string) => {
    // Optimistic
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
    // Ideally navigate here too? For now rely on Link
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
  };

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
            <div className="bg-muted p-3 rounded-full mb-3">
                <BellOff className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">When you get notifications, they'll show up here.</p>
        </div>
    );
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between p-4 border-b">
        <h4 className="font-semibold">Notifications</h4>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-6">
            Mark all read
        </Button>
      </div>
      <ScrollArea className="h-[300px]">
        {notifications.map((notification) => (
            <Link 
                href={`/watch/${notification.resourceId}`} 
                key={notification.id}
                onClick={() => handleMarkRead(notification.id, notification.resourceId)}
            >
                <div 
                    className={cn(
                        "flex gap-3 p-3 border-b hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-muted/20"
                    )}
                >
                    <div className="mt-1 relative">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.actor.imageUrl} />
                            <AvatarFallback>{notification.actor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
                            {notification.type === "LIKE_VIDEO" && <Heart className="w-3 h-3 text-red-500 fill-current" />}
                            {notification.type === "COMMENT" && <MessageCircle className="w-3 h-3 text-blue-500 fill-current" />}
                            {notification.type === "REPLY" && <Reply className="w-3 h-3 text-purple-500" />}
                            {notification.type === "FOLLOW" && <UserPlus className="w-3 h-3 text-green-500" />}
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm leading-snug">
                            <span className="font-semibold">{notification.actor.name}</span>
                            {" "}
                            {notification.type === "LIKE_VIDEO" && "liked your video"}
                            {notification.type === "COMMENT" && "commented on your video"}
                            {notification.type === "REPLY" && "replied to your comment"}
                            {notification.type === "FOLLOW" && "followed you"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                    {!notification.isRead && (
                        <div className="flex items-center justify-center">
                             <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                    )}
                </div>
            </Link>
        ))}
      </ScrollArea>
    </div>
  );
}
