"use client";

import { useState, useTransition } from "react";
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
import { Plus, ListMusic, Loader2 } from "lucide-react";
import { createPlaylist, addToPlaylist, getUserPlaylists } from "@/actions/playlists";

interface PlaylistDialogProps {
  videoId: string;
  trigger?: React.ReactNode;
}

export function PlaylistDialog({ videoId, trigger }: PlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState<{ id: string; name: string }[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // Fetch playlists when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
        setLoadingPlaylists(true);
        // Assuming getUserPlaylists is a server action that returns data
        getUserPlaylists()
            .then(data => setPlaylists(data))
            .finally(() => setLoadingPlaylists(false));
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    startTransition(async () => {
        await createPlaylist(newPlaylistName);
        setNewPlaylistName("");
        // Refresh list
        const updated = await getUserPlaylists();
        setPlaylists(updated);
    });
  };

  const handleAddToPlaylist = (playlistId: string) => {
    startTransition(async () => {
        await addToPlaylist(playlistId, videoId);
        setOpen(false);
        // Show success toast (TODO)
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="secondary" size="sm" className="gap-2">
                <ListMusic className="w-4 h-4" />
                Save
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save to playlist</DialogTitle>
          <DialogDescription>
            Add this video to one of your playlists or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
            {/* Create New */}
            <div className="flex items-end gap-2">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="name">New Playlist</Label>
                    <Input 
                        id="name" 
                        value={newPlaylistName} 
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="My Awesome Playlist" 
                    />
                </div>
                <Button onClick={handleCreatePlaylist} disabled={isPending || !newPlaylistName}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            <div className="border-t my-2" />

            {/* List Existing */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {loadingPlaylists ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    playlists.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No playlists found.</p>
                    ) : (
                        playlists.map(playlist => (
                            <div key={playlist.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md group">
                                <span className="font-medium text-sm">{playlist.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    disabled={isPending}
                                >
                                    Add
                                </Button>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
