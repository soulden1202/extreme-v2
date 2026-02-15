
"use client";

import { useEffect } from "react";
import { logWatchHistory } from "@/actions/history";

interface WatchHistoryLoggerProps {
  videoId: string;
}

export function WatchHistoryLogger({ videoId }: WatchHistoryLoggerProps) {
  useEffect(() => {
    // Log view after 5 seconds of "viewing" (page load)
    // In a real app, this should hook into the video player's progress.
    // For now, page dwell time > 5s is a good enough proxy for "watched".
    
    const timer = setTimeout(() => {
        logWatchHistory(videoId).catch(err => console.error("Failed to log history", err));
    }, 5000);

    return () => clearTimeout(timer);
  }, [videoId]);

  return null;
}
