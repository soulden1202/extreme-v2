import { db } from "@/db";
import { videos, users, likes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/video-player";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { PlaylistDialog } from "@/components/playlist-dialog";

// ... previous imports

import { currentUser } from "@clerk/nextjs/server";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { SubscribeButton } from "@/components/subscribe-button";
import { WatchHistoryLogger } from "@/components/watch-history-logger";
import { getSubscriberCount } from "@/actions/subscriptions";

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const user = await currentUser();

  // 1. Fetch Video
  const video = await db.query.videos.findFirst({
    where: eq(videos.id, id),
    with: {
      user: true,
      likes: true, // Fetch all likes to count them
    },
  });

  if (!video) {
    notFound();
  }

  const subscriberCount = await getSubscriberCount(video.userId);

  // 2. Determine "Up Next"
  const recommendedVideos = await db.query.videos.findMany({
    where: (videos, { ne }) => ne(videos.id, id),
    limit: 5,
    with: {
        user: true
    }
  });

  // 3. Check if *Current User* liked this video
  // We need to find the user in our DB first using Clerk ID
  let isLiked = false;
  if (user) {
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });
    
    if (dbUser) {
        // Check if there's a like record
        const userLike = await db.query.likes.findFirst({
            where: (likes, { and, eq }) => and(
                eq(likes.userId, dbUser.id),
                eq(likes.videoId, id)
            )
        });
        isLiked = !!userLike;
    }
  }

  // 4. Check Subscription Status
  let isSubscribed = false;
  let isOwner = false;
  
  if (user) {
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });

    if (dbUser) {
        if (dbUser.id === video.userId) {
            isOwner = true;
        } else {
            const subscription = await db.query.subscriptions.findFirst({
                where: (subscriptions, { and, eq }) => and(
                    eq(subscriptions.followerId, dbUser.id),
                    eq(subscriptions.followingId, video.userId)
                )
            });
            isSubscribed = !!subscription;
        }
    }
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content: Video Player & Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
             <VideoPlayer 
                key={video.id}
                videoId={video.id}
                src={video.videoUrl} 
                poster={video.thumbnailUrl}
                controls 
                autoPlay 
                className="w-full h-full object-contain"
             />
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{video.title}</h1>
                {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, i) => (
                            <Link key={i} href={`/search?q=${tag}`}>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                    #{tag}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-border">
                        <AvatarImage src={video.user.imageUrl} alt={video.user.name} />
                        <AvatarFallback>{video.user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-lg">{video.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{subscriberCount} subscribers</p>
                    </div>
                    
                    <SubscribeButton 
                        targetUserId={video.user.id} 
                        initialIsSubscribed={isSubscribed} 
                        isOwner={isOwner} 
                    />
                </div>
                
                <div className="flex gap-2">
                    <LikeButton 
                        videoId={video.id} 
                        initialIsLiked={isLiked} 
                        initialLikeCount={video.likes.length} 
                    />
                    <PlaylistDialog videoId={video.id} />
                    {/* Share Button placeholder */}
                 </div>
            </div>
            
            <Separator />
            
            <div className="bg-muted/30 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-sm md:text-base text-muted-foreground/90 leading-relaxed">
                    {video.description || "No description provided."}
                </p>
            </div>

            <Separator />
            
            <CommentSection videoId={video.id} />
        </div>
      </div>

      {/* Sidebar: Recommended Videos */}
      <div className="hidden lg:block space-y-4">
        <h2 className="font-semibold text-xl">Up Next</h2>
        <div className="flex flex-col gap-4">
            {recommendedVideos.length === 0 ? (
                <p className="text-muted-foreground">No recommendations.</p>
            ) : (
                recommendedVideos.map((rec) => (
                    <Link key={rec.id} href={`/watch/${rec.id}`} className="flex gap-2 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                        <div className="w-40 aspect-video bg-black rounded-md shrink-0 overflow-hidden relative border border-border">
                            <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{rec.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{rec.user.name}</p>
                        </div>
                    </Link>
                ))
            )}
        </div>
      </div>
      <WatchHistoryLogger videoId={video.id} />
    </div>
  );
}
