
import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "npm:@imagemagick/magick-wasm@0.0.30";

const wasmBytes = await Deno.readFile(
  new URL("magick.wasm", import.meta.resolve("npm:@imagemagick/magick-wasm@0.0.30"))
);
await initializeImageMagick(wasmBytes);

const BUCKET = "team-media-private";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function processImage(input: Uint8Array, maxDimension: number, quality: number): Uint8Array {
  return ImageMagick.read(input, (img): Uint8Array => {
    img.autoOrient();

    for (const profile of [...img.profileNames]) {
      img.removeProfile(profile);
    }
    img.comment = null;
    img.label = null;

    const width = img.width;
    const height = img.height;
    const longest = Math.max(width, height);
    if (longest > maxDimension) {
      const scale = maxDimension / longest;
      img.resize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
    }

    img.quality = quality;
    img.format = MagickFormat.Jpeg;
    return img.write(MagickFormat.Jpeg, (data) => new Uint8Array(data));
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let uploadedPaths: string[] = [];
  let insertedMediaId: string | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required.");
    const token = authHeader.slice(7);

    const url = Deno.env.get("SUPABASE_URL")!;
    const publishableKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")!)["default"];
    const secretKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!)["default"];

    const userClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const adminClient = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Invalid or expired session.");
    const userId = userData.user.id;

    const rolesRes = await userClient.from("user_roles").select("role").eq("user_id", userId);
    if (rolesRes.error) throw rolesRes.error;
    const roles = (rolesRes.data ?? []).map((r: any) => r.role);
    if (!roles.some((r: string) => ["parent_player", "admin", "manager", "photographer"].includes(r))) {
      throw new Error("Team access is required.");
    }

    if (roles.some((r:string)=>["admin","manager"].includes(r))) {
      const claims=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
      if(claims.aal!=="aal2") throw new Error("Complete multi-factor authentication first.");
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Image file is required.");
    if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG, and WebP images are allowed.");
    if (file.size <= 0 || file.size > MAX_BYTES) throw new Error("Image must be 8 MB or smaller.");

    const purpose = String(form.get("purpose") ?? "gallery").trim();
    if (!["gallery", "profile"].includes(purpose)) throw new Error("Invalid upload purpose.");

    const playerId = String(form.get("player_id") ?? "").trim() || null;
    const albumId = String(form.get("album_id") ?? "").trim() || null;
    const caption = String(form.get("caption") ?? "").trim().slice(0, 600) || null;

    if (purpose === "profile") {
      if (!playerId) throw new Error("Player is required for a profile photo.");
      const guardianRes = await userClient.from("guardians").select("id").eq("user_id", userId).maybeSingle();
      if (guardianRes.error) throw guardianRes.error;
      if (!guardianRes.data) throw new Error("Guardian profile required.");

      const linkRes = await userClient.from("player_guardians")
        .select("player_id")
        .eq("guardian_id", guardianRes.data.id)
        .eq("player_id", playerId)
        .maybeSingle();
      if (linkRes.error) throw linkRes.error;
      if (!linkRes.data) throw new Error("You can only upload a profile photo for your linked player.");
    }

    if (albumId) {
      const albumRes = await userClient.from("albums").select("id,created_by,allow_contributions,deleted_at").eq("id", albumId).is("deleted_at",null).maybeSingle();
      if (albumRes.error) throw albumRes.error;
      if (!albumRes.data) throw new Error("Album not found or unavailable.");
      if(!roles.some((r:string)=>["admin","manager"].includes(r)) && albumRes.data.created_by!==userId && !albumRes.data.allow_contributions) throw new Error("Uploads are disabled in this album.");
    }

    const existingBucket = await adminClient.storage.getBucket(BUCKET);
    if (existingBucket.error) {
      const create = await adminClient.storage.createBucket(BUCKET, {
        public: false,
        allowedMimeTypes: ["image/jpeg"],
        fileSizeLimit: "10MB",
      });
      if (create.error && !create.error.message.toLowerCase().includes("already")) {
        throw create.error;
      }
    }

    const originalBytes = new Uint8Array(await file.arrayBuffer());
    const processed = processImage(originalBytes, purpose === "profile" ? 1200 : 1800, 86);
    const thumbnail = processImage(originalBytes, 600, 78);

    const date = new Date();
    const folder = `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const base = crypto.randomUUID();
    const mainPath = `${userId}/${folder}/${base}.jpg`;
    const thumbPath = `${userId}/${folder}/${base}-thumb.jpg`;

    const mainUpload = await adminClient.storage.from(BUCKET).upload(mainPath, processed, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
    if (mainUpload.error) throw mainUpload.error;
    uploadedPaths.push(mainPath);

    const thumbUpload = await adminClient.storage.from(BUCKET).upload(thumbPath, thumbnail, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
    if (thumbUpload.error) throw thumbUpload.error;
    uploadedPaths.push(thumbPath);

    const mediaRes = await userClient.from("media_items").insert({
      album_id: albumId,
      uploader_id: userId,
      media_type: "photo",
      original_path: mainPath,
      processed_private_path: mainPath,
      processed_public_path: null,
      thumbnail_path: thumbPath,
      status: "pending",
      visibility: "private_team",
      exif_stripped: true,
      consent_reviewed: false,
      caption,
      filename: file.name.replace(/[^a-zA-Z0-9 ._-]/g,"_").slice(0,120),
    }).select("id,album_id,media_type,processed_private_path,thumbnail_path,status,visibility,exif_stripped,consent_reviewed,created_at").single();

    if (mediaRes.error) throw mediaRes.error;
    insertedMediaId = mediaRes.data.id;

    let profileRequest = null;
    if (purpose === "profile" && playerId) {
      const requestRes = await userClient.from("profile_photo_requests").insert({
        player_id: playerId,
        media_id: mediaRes.data.id,
        submitted_by: userId,
        status: "pending",
      }).select("*").single();
      if (requestRes.error) throw requestRes.error;
      profileRequest = requestRes.data;
    }

    uploadedPaths = [];
    insertedMediaId = null;

    return new Response(JSON.stringify({
      ok: true,
      media: mediaRes.data,
      profile_request: profileRequest,
      raw_original_retained: false,
      exif_gps_removed: true,
      moderation_required: true,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    try {
      if (uploadedPaths.length || insertedMediaId) {
        const url = Deno.env.get("SUPABASE_URL")!;
        const secretKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")!)["default"];
        const cleanup = createClient(url, secretKey, { auth: { persistSession: false } });
        if(insertedMediaId) await cleanup.from("media_items").delete().eq("id",insertedMediaId);
        if(uploadedPaths.length) await cleanup.storage.from(BUCKET).remove(uploadedPaths);
      }
    } catch (_) {}

    const message = error instanceof Error ? error.message : "Unable to upload image.";
    const status = message.includes("Authentication") || message.includes("session") ? 401 : 400;
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
});


