import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
const routes = ["/","/about","/accessibility","/conduct","/contact","/development","/end-of-season","/faq","/game-day","/kit","/media","/parents","/photo-safety","/privacy","/roster","/schedule","/sponsors"];
const port = 3219, base = "http://127.0.0.1:" + port;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"], env: {...process.env, NEXT_TELEMETRY_DISABLED: "1"} });
let output = "";
server.stdout.on("data", chunk => { output += chunk; });
server.stderr.on("data", chunk => { output += chunk; });
try {
  let ready = false;
  for(let attempt = 0; attempt < 60; attempt++) {
    try { if((await fetch(base, {signal:AbortSignal.timeout(1000)})).ok) { ready = true; break; } } catch {}
    if(server.exitCode !== null) throw new Error("Website server exited: " + output.slice(-2000));
    await delay(500);
  }
  assert(ready, "Website did not start");
  const results = [];
  for(const route of routes) {
    const response = await fetch(base + route, {signal:AbortSignal.timeout(15000), redirect:"manual"});
    assert.equal(response.status, 200, route + " must be publicly accessible");
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    assert(main, route + " needs main content");
    const text = main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi," ");
    const words = text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length || 0;
    assert(words >= 800, route + " has only " + words + " main-content words");
    const ids = [...main.matchAll(/id="(family-guide-\d+)"/g)].map(match=>match[1]);
    assert.equal(new Set(ids).size, ids.length, route + " has duplicate guide anchors");
    for(const match of main.matchAll(/href="#(family-guide-\d+)"/g)) assert(ids.includes(match[1]), route + " has a broken guide link");
    results.push({route, words});
  }
  const logo = await fetch(base + "/images/caledon-united-logo.webp");
  assert.equal(logo.status, 200);
  const bytes = Buffer.from(await logo.arrayBuffer());
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  const login = await (await fetch(base + "/login")).text();
  assert(!login.includes('id="family-guide-title"'), "Account screens must remain concise");
  console.table(results);
  console.log("All 17 public pages have 800+ main-content words; guide links, WebP delivery and concise login verified.");
} finally { server.kill(); }
