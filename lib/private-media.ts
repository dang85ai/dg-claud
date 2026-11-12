import { supabase } from "@/lib/supabase";
export async function openProcessedImage(path:string){
 if(!path)throw new Error("No processed image is available.");
 const result=await supabase.storage.from("team-media-private").download(path);
 if(result.error)throw new Error(result.error.message || "Unable to open private image.");
 if(!result.data || !result.data.size || !result.data.type.startsWith("image/"))throw new Error("The stored file is not a readable image.");
 return URL.createObjectURL(result.data);
}
