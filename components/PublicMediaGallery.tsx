import Link from "next/link";
import { Camera } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

type Album = { id: string; title: string; description?: string; photo_count: number };
type Photo = { id: string; caption?: string };

const mediaUrl = SUPABASE_URL + "/functions/v1/media-library";

async function getMedia<T>(path: string): Promise<T> {
  const response = await fetch(mediaUrl + path, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error("Media unavailable.");
  return response.json() as Promise<T>;
}

export async function PublicMediaGallery() {
  const library = await getMedia<{ albums: Album[] }>("/albums").catch(() => null);
  const approved = library?.albums.filter((album) => album.photo_count > 0) ?? [];
  if (!approved.length) {
    return (
      <div className="card flex flex-wrap items-center gap-4 p-6">
        <Camera className="text-red-600" aria-hidden="true" />
        <div className="grow">
          <h2 className="text-xl font-black uppercase">Team Albums</h2>
          <p className="mt-1 text-sm text-neutral-600">Approved public albums will appear here.</p>
        </div>
        <Link className="btn btn-light" href="/login">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {approved.map((album) => <PublicAlbum key={album.id} album={album} />)}
    </div>
  );
}

async function PublicAlbum({ album }: { album: Album }) {
  const detail = await getMedia<{ photos: Photo[] }>("/albums/" + encodeURIComponent(album.id)).catch(() => null);
  if (!detail?.photos.length) return null;

  return (
    <section className="card p-5">
      <h2 className="text-xl font-black uppercase">{album.title}</h2>
      {album.description ? <p className="mt-2 text-sm text-neutral-600">{album.description}</p> : null}
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {detail.photos.map((photo, index) => {
          const image = mediaUrl + "/photos/" + encodeURIComponent(photo.id) + "/image";
          return (
            <li key={photo.id}>
              <a href={image} className="block rounded focus-visible:outline-2" aria-label={photo.caption || `${album.title} photo ${index + 1}`}>
                {/* The media endpoint checks consent on every request. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image + "?thumbnail=1"} alt={photo.caption || ""} loading="lazy" className="aspect-square w-full rounded object-cover" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
