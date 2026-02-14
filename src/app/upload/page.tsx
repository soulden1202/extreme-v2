"use client";

import { useState } from "react";
import UploadVideo from "@/components/upload-video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVideo } from "@/actions/videos";
import { GlobalMediaController } from "@/lib/media-controller";

export default function UploadPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null); // In a real app, you'd pick a thumb. For now, we'll use a placeholder or derived one.

  const handleUploadSuccess = (url: string) => {
    setVideoUrl(url);
    // Cloudinary automatically generates thumbnails if we change extension to .jpg
    // This is a naive implementation, but works for the prototype
    const thumb = url.replace(/\.[^/.]+$/, ".jpg");
    setThumbnailUrl(thumb);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
      
      <form action={createVideo} className="space-y-6">
        {/* Hidden inputs to pass state to Server Action */}
        <input type="hidden" name="videoUrl" value={videoUrl || ""} />
        <input type="hidden" name="thumbnailUrl" value={thumbnailUrl || ""} />

        <div className="space-y-2">
           <Label>Video File</Label>
           {!videoUrl ? (
             <UploadVideo onUploadSuccess={handleUploadSuccess} />
           ) : (
             <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
                <video 
                    ref={(el) => {
                        if (el) {
                            // When this preview mounts or plays, we want to stop other videos.
                            el.onplay = () => GlobalMediaController.register(el);
                        }
                    }}
                    src={videoUrl} 
                    controls 
                    className="w-full h-full" 
                />
                <Button 
                    type="button"
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                        setVideoUrl(null);
                        setThumbnailUrl(null);
                    }}
                >
                    Change Video
                </Button>
             </div>
           )}
        </div>

        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="My awesome video" />
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" placeholder="What's this video about?" />
        </div>

        <div className="space-y-2">
            <Label htmlFor="tags">Tags (Comma separated)</Label>
            <Input id="tags" name="tags" placeholder="gaming, tutorial, funny" />
        </div>

        <Button type="submit" disabled={!videoUrl} size="lg" className="w-full">
            Publish Video
        </Button>
      </form>
    </div>
  );
}
