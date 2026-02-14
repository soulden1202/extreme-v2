import { db } from "@/db";
import { playlists, playlistVideos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";

interface PlaylistPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;

  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    with: {
        user: true,
        playlistVideos: {
            with: {
                video: {
                    with: {
                        user: true
                    }
                }
            },
            // Order by position (or added time if position is null)
            orderBy: [asc(playlistVideos.createdAt)] 
        }
    }
  });

  if (!playlist) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Playlist Info */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 sticky top-20">
            {playlist.playlistVideos.length > 0 && (
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative shadow-lg">
                     <img 
                        src={playlist.playlistVideos[0].video.thumbnailUrl} 
                        alt="Playlist Thumbnail" 
                        className="w-full h-full object-cover opacity-80"
                     />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                        <Link href={`/watch/${playlist.playlistVideos[0].videoId}`}>
                            <Button size="lg" className="rounded-full w-16 h-16 pl-5 shadow-xl hover:scale-105 transition-transform">
                                <Play className="w-8 h-8 fill-current" />
                            </Button>
                        </Link>
                     </div>
                </div>
            )}
            
            <div>
                <h1 className="text-2xl font-bold">{playlist.name}</h1>
                <p className="text-muted-foreground">
                    by {playlist.user.name} • {playlist.playlistVideos.length} videos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    updated {new Date(playlist.updatedAt).toLocaleDateString()}
                </p>
            </div>
            
            <div className="flex gap-2">
                 <Button className="w-full" asChild disabled={playlist.playlistVideos.length === 0}>
                    <Link href={playlist.playlistVideos.length > 0 ? `/watch/${playlist.playlistVideos[0].videoId}` : '#'}>
                        <Play className="w-4 h-4 mr-2" /> Play All
                    </Link>
                 </Button>
            </div>
        </div>
      </div>

      {/* Right Column: Video List */}
      <div className="lg:col-span-2 space-y-4">
        {playlist.playlistVideos.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                <p className="text-muted-foreground">This playlist is empty.</p>
                <Button variant="link" asChild>
                    <Link href="/">Browse Videos to Add</Link>
                </Button>
            </div>
        ) : (
            playlist.playlistVideos.map((pv, index) => (
                <Link key={pv.id} href={`/watch/${pv.videoId}`} className="group block">
                    <Card className="flex flex-row overflow-hidden hover:bg-muted/50 transition-colors border-transparent hover:border-border">
                         <div className="w-8 flex items-center justify-center text-muted-foreground font-medium shrink-0 bg-muted/30">
                            {index + 1}
                         </div>
                         <div className="w-40 aspect-video bg-black shrink-0 relative">
                            <img 
                                src={pv.video.thumbnailUrl} 
                                alt={pv.video.title} 
                                className="w-full h-full object-cover"
                            />
                         </div>
                         <div className="p-4 flex flex-col justify-center gap-1 min-w-0">
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {pv.video.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {pv.video.user.name} • {pv.video.views} views
                            </p>
                         </div>
                    </Card>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}
