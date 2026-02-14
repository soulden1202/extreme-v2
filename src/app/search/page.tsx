import { db } from "@/db";
import { videos } from "@/db/schema";
import { ilike, or, desc, sql } from "drizzle-orm";
import Link from "next/link"; // Use Link for audio safety
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams; // Await params in Next.js 15 (if needed, though standard props work)
  // Actually, standard SearchParams are often just passed directly, but await is safer for future proofing.
  // Wait, in Next 15 Page props are async.
  
  const query = q || "";

  if (!query) {
    return (
        <div className="container mx-auto p-4 text-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Search for something</h1>
            <p className="text-muted-foreground">Type within the search bar above to find videos.</p>
        </div>
    );
  }

  // imports removed from here

  const results = await db.query.videos.findMany({
    where: or(
        ilike(videos.title, `%${query}%`),
        ilike(videos.description, `%${query}%`),
        // Search inside tags array by converting to string
        sql`array_to_string(${videos.tags}, ' ') ILIKE ${`%${query}%`}`
    ),
    orderBy: [desc(videos.createdAt)],
    with: {
        user: true
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Search results for "{query}"</h1>
      
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No videos found</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
                We couldn't find any videos matching "{query}". Try searching for something else.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
