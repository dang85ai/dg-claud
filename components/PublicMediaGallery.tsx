import Link from "next/link";
import { Camera } from "lucide-react";
import { getPublicMedia, loadPublicAlbums, mediaUrl, type PublicAlbum as Album } from "@/lib/public-media";
type Photo = { id: string; caption?: string };

export async function PublicMediaGallery() {
  const approved = await loadPublicAlbums().catch(() => []);
  if (!approved.length) {
    return (
      <div className="card flex flex-wrap items-center gap-4 p-6">
        <Camera className="text-red-600" aria-hidden="true" />
        <div className="grow">
          <h2 className="text-xl font-black uppercase">Team Albums</h2>
          <p className="mt-1 text-sm text-neutral-600">No public albums have been published yet.</p>
        </div>
        <Link className="btn btn-light" href="/portal/media">Parent Portal</Link>
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
  const detail = await getPublicMedia<{ photos: Photo[] }>("/albums/" + encodeURIComponent(album.id)).catch(() => null);
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
