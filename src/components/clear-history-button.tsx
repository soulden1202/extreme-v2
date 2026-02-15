
"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { clearWatchHistory } from "@/actions/history";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

export function ClearHistoryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClear = () => {
    if (!confirm("Are you sure you want to clear your entire watch history?")) return;
    
    startTransition(async () => {
        try {
            await clearWatchHistory();
            toast({ title: "History Cleared" });
            router.refresh();
        } catch (error) {
            toast({ title: "Error", description: "Failed to clear history.", variant: "destructive" });
        }
    });
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClear} disabled={isPending}>
        <Trash2 className="w-4 h-4 mr-2" />
        Clear History
    </Button>
  );
}
