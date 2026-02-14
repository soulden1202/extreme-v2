"use server";

import { db } from "@/db";
import { playlists, playlistVideos, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/auth-utils";

export async function createPlaylist(name: string) {
  const dbUser = await getDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  await db.insert(playlists).values({
    name,
    userId: dbUser.id,
  });

  revalidatePath("/playlists");
}

export async function addToPlaylist(playlistId: string, videoId: string) {
  const dbUser = await getDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  // Verify ownership of playlist
  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, playlistId),
  });

  if (!playlist) throw new Error("Playlist not found");
  
  if (playlist.userId !== dbUser.id) {
    throw new Error("Unauthorized to modify this playlist");
  }

  // Get current max position
  // (Simplified: just appending for now. In a real app we'd query max position)
  
  await db.insert(playlistVideos).values({
    playlistId,
    videoId,
    // position: 0 // Default
  });
  
  revalidatePath(`/playlists/${playlistId}`);
}

export async function getUserPlaylists() {
    const dbUser = await getDbUser();
    if (!dbUser) return [];
  
    return await db.query.playlists.findMany({
      where: eq(playlists.userId, dbUser.id),
      orderBy: (playlists, { desc }) => [desc(playlists.createdAt)],
    });
  }
