
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleSubscription } from "@/actions/subscriptions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  targetUserId: string;
  initialIsSubscribed: boolean;
  isOwner?: boolean;
}

export function SubscribeButton({ targetUserId, initialIsSubscribed, isOwner }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubscribe = () => {
    startTransition(async () => {
      try {
        const newStatus = await toggleSubscription(targetUserId);
        setIsSubscribed(newStatus);
        
        toast({
            title: newStatus ? "Subscribed" : "Unsubscribed",
            description: newStatus 
                ? "You will now see updates from this channel." 
                : "You have unsubscribed from this channel.",
        });
        
        router.refresh();
      } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update subscription. Try again later.",
            variant: "destructive"
        });
      }
    });
  };

  if (isOwner) {
    return null;
  }

  return (
    <Button 
        variant={isSubscribed ? "secondary" : "default"} 
        onClick={handleSubscribe}
        disabled={isPending}
        className={isSubscribed ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}
    >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}
