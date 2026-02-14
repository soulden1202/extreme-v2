"use client";

import { useRef, useEffect } from "react";
import { incrementView } from "@/actions/views";
import { GlobalMediaController } from "@/lib/media-controller";

interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  videoId?: string; // Optional for now to keep backward compatibility, but needed for tracking
}

export function VideoPlayer({ src, poster, className, videoId, ...props }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasCountedRef = useRef(false);
  const hasAttemptedAutoplay = useRef(false);
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    console.log(`[VideoPlayer ${instanceId.current}] MOUNTED for videoId: ${videoId}`);

    // MANUAL SOURCE MANAGEMENT
    // We set the src manually to avoid React fighting with our cleanup logic.
    const currentSrc = videoElement.getAttribute("src");
    if (currentSrc !== src) {
        console.log(`[VideoPlayer ${instanceId.current}] Setting manual src`);
        videoElement.setAttribute("src", src);
        videoElement.load();
    }

    // Register with GlobalController immediately to pause others
    GlobalMediaController.register(videoElement);

    const handleCanPlay = () => {
        if (hasAttemptedAutoplay.current) return;
        hasAttemptedAutoplay.current = true;
        console.log(`[VideoPlayer ${instanceId.current}] Attempting autoplay`);

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                    console.error(`[VideoPlayer ${instanceId.current}] Autoplay prevented:`, error);
                }
            });
        }
    };

    videoElement.addEventListener('canplay', handleCanPlay);

    if (videoElement.readyState >= 3) {
        handleCanPlay();
    }

    // View Counting
    hasCountedRef.current = false;
    const handleTimeUpdate = () => {
        if (!videoId) return;
        if (hasCountedRef.current) return;

        if (videoElement.currentTime > 5) {
            incrementView(videoId).catch(e => console.error(e));
            hasCountedRef.current = true;
        }
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      console.log(`[VideoPlayer ${instanceId.current}] UNMOUNTING (Cleanup)`);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      
      // NUCLEAR CLEANUP
      // Because we manage src manually, we can safely wipe it here without React interfering on re-render.
      videoElement.pause();
      videoElement.removeAttribute('src'); 
      videoElement.load(); 
      console.log(`[VideoPlayer ${instanceId.current}] Cleanup Complete`);
    };
  }, [videoId, src]);

  return (
    <video
      ref={videoRef}
      // NO SRC PROP HERE! We manage it in useEffect.
      poster={poster}
      className={className}
      controls
      playsInline
      preload="metadata"
      {...props}
    />
  );
}
