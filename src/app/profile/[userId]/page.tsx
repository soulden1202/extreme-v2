import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video } from "lucide-react";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
        videos: {
            orderBy: [desc(videos.createdAt)],
        }
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="text-4xl">{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground text-lg">
                {user.videos.length} {user.videos.length === 1 ? 'Video' : 'Videos'}
            </p>
            {/* Future: Bio, Social Links, Follow Button */}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
            {user.videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Video className="w-12 h-12 mb-4 opacity-20" />
                    <p>No videos uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {user.videos.map((video) => (
                        <div key={video.id} className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all">
                            <Link href={`/watch/${video.id}`} className="block aspect-video bg-muted relative">
                                <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title} 
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                            </Link>
                            <div className="p-3">
                                <Link href={`/watch/${video.id}`}>
                                    <h3 className="font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">
                                        {video.title}
                                    </h3>
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </TabsContent>
        <TabsContent value="about" className="mt-6">
             <div className="bg-muted/30 p-6 rounded-lg text-muted-foreground">
                <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                {/* Future: Bio content */}
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
