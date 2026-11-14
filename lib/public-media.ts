import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

export type PublicAlbum = { id: string; title: string; description?: string; photo_count: number };

export const mediaUrl = SUPABASE_URL + "/functions/v1/media-library";

export async function getPublicMedia<T>(path: string): Promise<T> {
  const response = await fetch(mediaUrl + path, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error("Media unavailable.");
  return response.json() as Promise<T>;
}

export async function loadPublicAlbums(): Promise<PublicAlbum[]> {
  const { albums } = await getPublicMedia<{ albums: PublicAlbum[] }>("/albums");
  return albums.filter((album) => album.photo_count > 0);
}
