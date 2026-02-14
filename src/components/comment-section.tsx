import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { desc, eq, isNull } from "drizzle-orm";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { currentUser } from "@clerk/nextjs/server";
import { MessageCircle } from "lucide-react";

interface CommentSectionProps {
  videoId: string;
}

export async function CommentSection({ videoId }: CommentSectionProps) {
  const user = await currentUser();
  let dbUserId: string | undefined;

  if (user) {
    const dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, user.id),
    });
    dbUserId = dbUser?.id;
  }

  // Fetch comments with 3 levels of nesting max for now
  const rootComments = await db.query.comments.findMany({
    where: (c, { and, eq, isNull }) => and(
        eq(c.videoId, videoId),
        isNull(c.parentId)
    ),
    orderBy: [desc(comments.createdAt)],
    with: {
        user: true,
        likes: true,
        replies: {
            with: {
                user: true,
                likes: true,
                replies: {
                    with: {
                        user: true,
                        likes: true
                    }
                }
            },
            orderBy: (c, { asc }) => [asc(c.createdAt)]
        }
    }
  });

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6">Comments</h3>
      
      <CommentForm videoId={videoId} />

      <div className="space-y-6">
        {rootComments.map((comment) => (
            <CommentItem 
                key={comment.id} 
                videoId={videoId} 
                comment={comment} 
                currentUserDBId={dbUserId}
            />
        ))}
        {rootComments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <div className="bg-muted p-3 rounded-full mb-3">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <p className="font-medium">No comments yet</p>
                <p className="text-sm mt-1">Be the first to share your thoughts!</p>
            </div>
        )}
      </div>
    </div>
  );
}
