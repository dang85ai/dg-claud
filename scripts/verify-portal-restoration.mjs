import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const needed = [
 "app/roster/page.tsx",
 "app/admin/players/page.tsx", "app/admin/formation/page.tsx",
 "app/admin/modules/[module]/page.tsx", "app/admin/finances/page.tsx",
 "app/admin/media/page.tsx", "app/admin/sponsors/page.tsx",
 "app/portal/players/page.tsx", "app/portal/activity/[section]/page.tsx",
 "app/portal/media/page.tsx", "app/portal/finances/page.tsx",
 "components/PlayerPhotoCrop.tsx", "components/RosterPhotoTools.tsx",
 "components/PlayerCardDownload.tsx", "components/RosterWorkspace.tsx",
 "components/RosterProfiles.tsx", "components/PortalHeader.tsx",
 "public/roster/home-jersey-2026.webp","public/roster/away-jersey-2026.webp",
 "public/assets/sponsors/jb-aluminum-products-limited.webp",
 "public/assets/sponsors/knockout-sports-bar.webp"
];
for(const name of needed)assert.ok(existsSync(name), "Restoration regression: missing file "+name);
const source = file => readFileSync(file,"utf8");
const check = (file, snippets) => {
 const txt = source(file);
 for(const snippet of snippets)assert.ok(txt.includes(snippet),file+": missing safeguard or link: "+snippet);
};
check("components/RosterPhotoTools.tsx",["PlayerPhotoCrop","mediaLibrary","consent","Bearer ","Approve Reviewed Photo"]);
check("components/RosterWorkspace.tsx",["PendingRosterPhotoReview","photo.review","consent_reviewed","photo_consent"]);
check("components/RosterProfiles.tsx",["ApprovedPortrait","PlayerCardDownload","photo_consent","privateAccess","FormationPitch"]);
check("components/PlayerCardDownload.tsx",["player.can_edit","private=true","photo_consent","Home","Away"]);
check("components/PortalHeader.tsx",["portal-sidebar","portal-drawer","Switch to Management","/portal/activity/attendance","/admin/modules/schedule"]);
check("components/TeamFinance.tsx",["team_finance_settings","team_budget_lines","team_transactions"]);
check("components/MediaLibrary.tsx",["media-api","privateMode"]);
check("netlify.toml",["for = \"/portal/*\"","for = \"/admin/*\"","Cache-Control = \"private, no-store\""]);
assert.ok(!existsSync("lib/team-squad.ts"),"Do not republish October's hard-coded minor roster");
console.log("Restoration source checks passed ("+needed.length+" files and role/consent guards).");
console.log("NOTE: browser interaction, parental consent and MFA-account E2E still require real test sessions.");
