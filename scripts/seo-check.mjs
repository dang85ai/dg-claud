#!/usr/bin/env node
// Build-time guardrails; live redirects and Google indexing still require external verification.
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(p, "utf8");
const canonical = "https://caledonunited2018girls.ca";
const layout = read("app/layout.tsx");
const robots = read("app/robots.ts");
const sitemap = read("app/sitemap.ts");
const seo = read("lib/seo.ts");
const season = read("app/end-of-season/layout.tsx");
const sw = read("public/sw.js");
const netlify = read("netlify.toml");
const checks = [];
const test = (name, ok) => checks.push({name, ok: Boolean(ok)});
const baseToken = "$" + "{baseUrl}";
const sourceURL = (path) => baseToken + path;

test("Canonical domain in Next.js metadata", layout.includes('const siteUrl = "' + canonical + '"') && layout.includes("metadataBase: new URL(siteUrl)"));
test("Shared SEO helper uses the preferred domain", seo.includes('const siteUrl = "' + canonical + '"'));
test("robots.txt declares the canonical sitemap", robots.includes(canonical) && robots.includes("/sitemap.xml"));
test("Sitemap uses canonical domain", sitemap.includes(canonical));
test("Sitemap includes priority public pages", ["/schedule", "/about", "/kit", "/sponsors", "/contact"].every((path) => sitemap.includes(sourceURL(path))));
test("Sitemap excludes private and placeholder pages", !["/portal", "/admin", "/order", "/roster", "/media", "/end-of-season", "/login"].some((path) => sitemap.includes(sourceURL(path))));
test("Unfinished season recap has noindex", season.includes("index: false"));
test("Legacy Netlify hostname redirects permanently", netlify.includes("https://caledon-u9-girls-2026.netlify.app/*") && netlify.includes("status = 301"));
test("Protected routes are noindex and no-store", ["/portal", "/portal/*", "/admin", "/admin/*", "/order"].every((path) => {
  const marker = '  for = "' + path + '"';
  const start = netlify.indexOf(marker);
  if (start < 0) return false;
  const end = netlify.indexOf("[[headers]]", start + marker.length);
  const block = netlify.slice(start, end < 0 ? undefined : end);
  return block.includes("X-Robots-Tag") && block.includes("no-store");
}));
test("Service worker skips document requests", sw.includes('request.mode === "navigate"') && sw.includes('request.destination === "document"'));
test("Service worker limits cache to public assets", sw.includes("PUBLIC_ASSET_PATHS.some") && sw.includes('url.origin !== self.location.origin'));
test("Official contact email present", read("lib/team-config.ts").includes("girlsoccer2018@gmail.com"));
test("Homepage has self-canonical", read("app/page.tsx").includes('alternates: { canonical: "/" }'));
test("Search Console verification retained", layout.includes('name="google-site-verification"'));

for (const c of checks) console.log((c.ok ? "PASS" : "FAIL") + "  " + c.name);
const failed = checks.filter((c) => !c.ok);
console.log("SEO checks: " + (checks.length - failed.length) + "/" + checks.length + " passed");
if (failed.length) process.exitCode = 1;
