
import { db } from "@/db";
import { likes, users, videos } from "@/db/schema";
import { getDbUser } from "@/lib/auth-utils";
import { VideoCard } from "@/components/video-card";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

export default async function LikedVideosPage() {
  const dbUser = await getDbUser();

  if (!dbUser) {
    redirect("/sign-in");
  }

  const likedVideos = await db
    .select({
      video: videos,
      user: users,
      likedAt: likes.createdAt,
    })
    .from(likes)
    .innerJoin(videos, eq(likes.videoId, videos.id))
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(likes.userId, dbUser.id))
    .orderBy(desc(likes.createdAt));

  // Transform data to match VideoCard props
  const formattedVideos = likedVideos.map(({ video, user }) => ({
    ...video,
    user: {
      name: user.name,
      imageUrl: user.imageUrl,
    },
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
            <Heart className="w-8 h-8 text-red-600 fill-red-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">Liked Videos</h1>
            <p className="text-muted-foreground">{likedVideos.length} videos</p>
        </div>
      </div>

      {formattedVideos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>You haven't liked any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {formattedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
