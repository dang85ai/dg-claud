import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

console.log(`Materialized ${groups.size} sponsorship assets.`);
