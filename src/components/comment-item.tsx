"use client";
import Link from "next/link";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { CommentForm } from "./comment-form";
import { toggleCommentLike, deleteComment } from "@/actions/comments";
import { ThumbsUp, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface CommentItemProps {
  videoId: string;
  comment: {
    id: string;
    text: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      imageUrl: string;
      clerkId: string;
    };
    likes: Array<{ userId: string }>;
    replies?: Array<any>; // Recursive type definition is complex, 'any' for now
  };
  currentUserDBId?: string;
}

export function CommentItem({ videoId, comment, currentUserDBId }: CommentItemProps) {
  const { user } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  // Optimistic UI for likes could be added here, but relying on server revalidate for simplicity first
  const isLiked = comment.likes.some(like => like.userId === currentUserDBId);

  const handleLike = async () => {
    await toggleCommentLike(comment.id, videoId);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
        await deleteComment(comment.id, videoId);
    }
  };

  return (
    <div className="flex gap-4 group">
        <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={comment.user.imageUrl} />
            <AvatarFallback>{comment.user.name.substring(0,2)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{comment.user.name}</span>
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {comment.text.split(/(@\w+)/g).map((part, index) => {
                    if (part.startsWith("@")) {
                        const username = part.slice(1);
                        return (
                            <Link href={`/profile/${username}`} key={index} className="text-blue-500 hover:underline font-semibold">
                                {part}
                            </Link>
                        );
                    }
                    return part;
                })}
            </p>
            
            {/* Actions */}
            <div className="flex items-center gap-4 pt-1">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-auto p-0 text-muted-foreground hover:text-foreground", isLiked && "text-primary hover:text-primary/80")}
                    onClick={handleLike}
                >
                    <ThumbsUp className={cn("w-4 h-4 mr-1", isLiked && "fill-current")} />
                    <span className="text-xs">{comment.likes.length > 0 ? comment.likes.length : ""}</span>
                </Button>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsReplying(!isReplying)}
                >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Reply</span>
                </Button>

                {currentUserDBId === comment.user.id && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Reply Form */}
            {isReplying && (
                <div className="mt-4">
                    <CommentForm 
                        videoId={videoId} 
                        parentId={comment.id} 
                        onSuccess={() => setIsReplying(false)}
                        onCancel={() => setIsReplying(false)}
                        autoFocus
                    />
                </div>
            )}

            {/* Replies List */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-muted">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            videoId={videoId} 
                            comment={reply} 
                            currentUserDBId={currentUserDBId}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
