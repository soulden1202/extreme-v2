import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditVideoDialog } from "@/components/edit-video-dialog";
import { DeleteVideoDialog } from "@/components/delete-video-dialog";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!dbUser) {
    redirect("/");
  }

  const userVideos = await db.query.videos.findMany({
    where: eq(videos.userId, dbUser.id),
    orderBy: [desc(videos.createdAt)],
  });

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Thumbnail</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {userVideos.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No videos found. Start uploading!
                        </TableCell>
                    </TableRow>
                ) : (
                    userVideos.map((video) => (
                        <TableRow key={video.id}>
                            <TableCell>
                                <img src={video.thumbnailUrl} alt={video.title} className="w-16 h-9 object-cover rounded bg-muted" />
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">
                                {video.title}
                                <div className="md:hidden text-xs text-muted-foreground mt-1">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary">Check</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(video.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <EditVideoDialog video={video} />
                                <DeleteVideoDialog videoId={video.id} />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
