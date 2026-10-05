import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const sourceDir = path.join(process.cwd(), "assets", "sponsors-base64");
const outputDir = path.join(process.cwd(), "public", "sponsors");
await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir)).filter((name) => name.endsWith(".b64")).sort();
const groups = new Map();

for (const file of files) {
  const match = file.match(/^(.*\.webp)\.(\d{3})\.b64$/);
  if (!match) continue;
  const [, outputName] = match;
  if (!groups.has(outputName)) groups.set(outputName, []);
  groups.get(outputName).push(file);
}

for (const [outputName, parts] of groups) {
  const encodedParts = [];
  for (const part of parts.sort()) {
    encodedParts.push((await readFile(path.join(sourceDir, part), "utf8")).trim());
  }
  await writeFile(path.join(outputDir, outputName), Buffer.from(encodedParts.join(""), "base64"));
}

const heroSourceDir = path.join(process.cwd(), "assets", "hero-base64");
const heroOutputDir = path.join(process.cwd(), "public", "images");
await mkdir(heroOutputDir, { recursive: true });

const heroParts = (await readdir(heroSourceDir))
  .filter((name) => name.startsWith("home-hero.webp.") && name.endsWith(".b64"))
  .sort();

if (!heroParts.length) {
  throw new Error("Homepage hero image source is missing.");
}

const heroEncoded = [];
for (const part of heroParts) {
  heroEncoded.push((await readFile(path.join(heroSourceDir, part), "utf8")).trim());
}

const heroBytes = Buffer.from(heroEncoded.join(""), "base64");
const heroHash = createHash("sha256").update(heroBytes).digest("hex");
const expectedHeroHash = "fc8ccff325f33f946ef68b53484f186c05664450cb99f8ca30c1b195af237882";

if (heroHash !== expectedHeroHash) {
  throw new Error(`Homepage hero image checksum mismatch: ${heroHash}`);
}

await writeFile(path.join(heroOutputDir, "home-hero.webp"), heroBytes);

console.log(`Materialized ${groups.size} sponsorship assets and homepage hero image.`);
