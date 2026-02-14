import { getUserPlaylists } from "@/actions/playlists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
    // This action already handles auth check internally and returns empty array if not logged in
    const playlists = await getUserPlaylists();

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Playlists</h1>
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="bg-muted p-6 rounded-full">
                        <ListMusic className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">No playlists yet</h2>
                        <p className="text-muted-foreground">Save videos to a playlist to see them here.</p>
                    </div>
                    <Button asChild>
                        <Link href="/">Browse Videos</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <Link key={playlist.id} href={`/playlists/${playlist.id}`} className="group">
                            <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                                <CardHeader className="bg-muted/50 aspect-video flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                    <ListMusic className="w-12 h-12 text-muted-foreground/50" />
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="line-clamp-1">{playlist.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        View Playlist
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
