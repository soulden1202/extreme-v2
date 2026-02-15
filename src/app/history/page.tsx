
import { getWatchHistory, clearWatchHistory } from "@/actions/history";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ClearHistoryButton } from "@/components/clear-history-button";

export default async function HistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const history = await getWatchHistory();

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <History className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Watch History</h1>
        </div>
        {history.length > 0 && (
            <ClearHistoryButton />
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
            <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">You haven't watched any videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item) => (
                <VideoCard key={item.videoId} video={item.video} />
            ))}
        </div>
      )}
    </div>
  );
}
