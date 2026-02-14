import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc, gt, sql } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/video-card";

export const dynamic = "force-dynamic";

export default async function TrendingPage() {
  // Fetch videos from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentVideos = await db.query.videos.findMany({
    where: gt(videos.createdAt, sevenDaysAgo),
    with: {
      user: true,
      likes: true,
      comments: true,
    },
    limit: 100, // Fetch a reasonable candidate set
  });

  // Calculate generic "Trending Score"
  // Score = Views * 1 + Likes * 5 + Comments * 3
  const rankedVideos = recentVideos.map((video) => {
    const score = 
        (video.views * 1) + 
        (video.likes.length * 5) + 
        (video.comments.length * 3);
    return { ...video, score };
  }).sort((a, b) => b.score - a.score); // Descending

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Trending This Week</h1>
        <p className="text-muted-foreground">The most popular content from the last 7 days.</p>
      </div>

      {rankedVideos.length === 0 ? (
        <div className="py-20 text-center">
            <p className="text-muted-foreground">Not enough data to show trending videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rankedVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
