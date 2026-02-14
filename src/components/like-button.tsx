"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/likes";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  videoId: string;
  initialIsLiked: boolean;
  initialLikeCount: number;
}

export function LikeButton({ videoId, initialIsLiked, initialLikeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleToggle = async () => {
    if (!isSignedIn) {
        // Redirect to login or open modal (for now just return)
        return;
    }

    // Optimistic Update
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsPending(true);

    try {
      await toggleLike(videoId);
    } catch (error) {
      // Revert on failure
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error("Failed to toggle like", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1.5 hover:text-red-500 transition-colors"
        onClick={handleToggle}
        disabled={isPending}
    >
      <Heart 
        className={cn(
            "w-5 h-5 transition-all", 
            isLiked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"
        )} 
      />
      <span className={cn(isLiked && "text-red-500 font-medium")}>{likeCount}</span>
    </Button>
  );
}
