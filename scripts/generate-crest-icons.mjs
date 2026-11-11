import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// WebP crest is checked into the repository. Generate platform fallbacks
// from this same transparent original, never from the previous team logo.
const brandDir = path.join(process.cwd(), "public", "assets", "brand");
const crest = await readFile(path.join(brandDir, "caledon-united-crest.webp"));

for (const [size, file] of [
  [32, "caledon-united-favicon-32.webp"],
  [192, "caledon-united-icon-192.webp"],
  [512, "caledon-united-icon-512.webp"]
]) {
  await sharp(crest).resize(size, size).webp({ lossless: true }).toFile(path.join(brandDir, file));
}

for (const [size, file] of [
  [180, "caledon-united-apple-180.png"],
  [512, "caledon-united-social.png"],
  [150, "mstile-150.png"]
]) {
  await sharp(crest).resize(size, size).png().toFile(path.join(brandDir, file));
}

// PNG-compressed ICO provides a fallback for browsers requesting /favicon.ico.
const png32 = await sharp(crest).resize(32, 32).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(1, 2);   // ICO format
icoHeader.writeUInt16LE(1, 4);   // 1 image
icoHeader[6] = 32; icoHeader[7] = 32;
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(png32.length, 14);
icoHeader.writeUInt32LE(22, 18);
await writeFile(path.join(process.cwd(), "public", "favicon.ico"), Buffer.concat([icoHeader, png32]));

console.log("Generated Caledon United crest icons: WebP, Apple PNG, and ICO.");
