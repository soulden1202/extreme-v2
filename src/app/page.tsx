import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allVideos = await db.query.videos.findMany({
    orderBy: [desc(videos.createdAt)],
    with: {
      user: true,
    },
  });

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold tracking-tight">Trending Now</h1>
        <Button asChild>
          <Link href="/upload">Upload Video</Link>
        </Button>
      </div>

      {allVideos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No videos found.</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/upload">Be the first to upload!</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </main>
  );
}
