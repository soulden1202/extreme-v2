"use client";

import { CldUploadButton } from "next-cloudinary";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadVideoProps {
  onUploadSuccess: (url: string) => void;
}

export default function UploadVideo({ onUploadSuccess }: UploadVideoProps) {
  return (
    <CldUploadButton
      uploadPreset="extreme_v2"
      options={{
        resourceType: "video",
        clientAllowedFormats: ["mp4", "webm", "mov"],
        maxFileSize: 50 * 1024 * 1024, // 50MB
      }}
      // @ts-ignore - The types for next-cloudinary are sometimes loose
      onSuccess={(result) => {
        if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
            onUploadSuccess(result.info.secure_url as string);
        }
      }}
    >
      <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md transition-colors cursor-pointer">
        <Upload className="w-4 h-4" />
        <span>Upload Video</span>
      </div>
    </CldUploadButton>
  );
}
