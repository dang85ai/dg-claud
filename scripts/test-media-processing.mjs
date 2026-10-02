import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { ImageMagick,initializeImageMagick,MagickFormat } from "@imagemagick/magick-wasm";
const require=createRequire(import.meta.url);
const ts=require("typescript");
await initializeImageMagick(await fs.readFile(new URL("magick.wasm",import.meta.resolve("@imagemagick/magick-wasm"))));
const source=await fs.readFile("supabase/functions/media-upload/index.ts","utf8");
const fn=source.slice(source.indexOf("function processImage"),source.indexOf("Deno.serve"));
const js=ts.transpileModule(fn,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
const processImage=new Function("ImageMagick","MagickFormat",js+";return processImage;")(ImageMagick,MagickFormat);
const fixture=new TextEncoder().encode("P3\n2 2\n255\n255 0 0 0 255 0 0 0 255 255 255 255\n");
const main=processImage(fixture,1200,86);
const original=Uint8Array.from(main);
const thumbnail=processImage(fixture,600,78);
for(let i=0;i<3;i++)processImage(fixture,600,78);
assert.deepEqual(main,original,"Main image bytes must survive later native-memory processing");
for(const bytes of [main,thumbnail]){
 assert.equal(bytes[0],255);assert.equal(bytes[1],216);
 ImageMagick.read(bytes,img=>{assert.equal(img.width,2);assert.equal(img.height,2);assert.equal(img.profileNames.length,0);});
}
console.log("Real upload processing: independent JPEG buffers, main/thumbnail decode and metadata removal passed.");
