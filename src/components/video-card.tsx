import Link from "next/link";
import { PlaylistDialog } from "@/components/playlist-dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, ListPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoCardProps {
    video: {
        id: string;
        title: string;
        thumbnailUrl: string;
        views: number;
        createdAt: Date;
        user: {
            name: string;
            imageUrl: string;
        };
        // Optional for ranking
        score?: number; 
    };
    rank?: number;
}

export function VideoCard({ video, rank }: VideoCardProps) {
    return (
        <div className="group relative bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-lg">
            {/* Ranking Badge if provided */}
            {rank && (
                <div className="absolute top-2 left-2 z-10">
                    <Badge variant={rank <= 3 ? "default" : "secondary"} className="text-xs font-bold shadow-md">
                        #{rank}
                    </Badge>
                </div>
            )}

            {/* Save to Playlist Button (Quick Action) */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <PlaylistDialog 
                    videoId={video.id} 
                    trigger={
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-background">
                            <ListPlus className="w-4 h-4" />
                        </Button>
                    } 
                 />
            </div>

            <Link href={`/watch/${video.id}`} className="block aspect-video bg-muted relative">
            <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            </Link>
            <div className="p-4 space-y-2">
            <Link href={`/watch/${video.id}`}>
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
                {video.title}
                </h3>
            </Link>
            <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{video.user.name} • {video.views} views</p>
            </div>
            {/* Optional Score display could go here if needed */}
            </div>
        </div>
    );
}
