"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlobalMediaController } from "@/lib/media-controller";

export function NavigationEvents() {
  const pathname = usePathname();

  useEffect(() => {
    // When the route changes, force pause on any active video.
    // This handles the "Client-Side Navigation" ghost audio issues.
    console.log(`[NavigationEvents] Route changed to ${pathname}. Cleaning up media.`);
    // GlobalMediaController.pauseAll(); // Temporarily disabled to test if Persistent Throne is enough
    // Use "Pause All" only if we really need it.
    GlobalMediaController.pauseAll();
  }, [pathname]);

  return null;
}
