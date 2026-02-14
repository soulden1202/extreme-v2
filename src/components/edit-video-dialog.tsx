"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateVideo } from "@/actions/video-management";
import { Loader2 } from "lucide-react";

interface EditVideoDialogProps {
  video: {
    id: string;
    title: string;
    description: string | null;
    tags: string[] | null;
  };
  trigger?: React.ReactNode;
}

export function EditVideoDialog({ video, trigger }: EditVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
        await updateVideo(video.id, formData);
        setOpen(false);
    } catch (error) {
        console.error("Failed to update video", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Make changes to your video details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                Title
                </Label>
                <Input
                id="title"
                name="title"
                defaultValue={video.title}
                className="col-span-3"
                required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                Description
                </Label>
                <Textarea
                id="description"
                name="description"
                defaultValue={video.description || ""}
                className="col-span-3"
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                Tags
                </Label>
                <Input
                id="tags"
                name="tags"
                defaultValue={video.tags?.join(", ") || ""}
                className="col-span-3"
                placeholder="Comma separated (e.g. gaming, funny)"
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
