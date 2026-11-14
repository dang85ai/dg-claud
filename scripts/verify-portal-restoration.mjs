import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const needed = [
 "app/roster/page.tsx", "app/conduct/page.tsx", "app/portal/conduct/page.tsx", "app/admin/conduct/page.tsx", "public/docs/caledon-soccer-grassroots-code-of-conduct-2026.pdf",
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
 "public/assets/sponsors/knockout-sports-bar.webp",
 "public/assets/team/staff/gabriel-borges.webp",
 "public/assets/team/staff/davinder-budwal.webp",
 "public/assets/team/staff/karam-budwal.webp",
 "public/assets/team/staff/melissa-catalano.webp",
 "public/assets/team/staff/daniel-guerra.webp",
 "public/assets/team/staff/natalie-guerra.webp",
 "public/assets/team/staff/courtney-quinn.webp",
 "public/assets/team/staff/giuseppe-tomaselli.webp"
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
check("components/PortalHeader.tsx",["portal-sidebar","portal-drawer","Switch to Management","/portal/activity/attendance","/admin/modules/schedule","/portal/conduct","/admin/conduct"]);
check("components/Footer.tsx",["instagram.com/caledonunitedfc2018girls","/conduct"]);
check("components/TeamFinance.tsx",["team_finance_settings","team_budget_lines","team_transactions"]);
check("components/MediaLibrary.tsx",["media-api","privateMode"]);
check("netlify.toml",["for = \"/portal/*\"","for = \"/admin/*\"","Cache-Control = \"private, no-store\""]);
check("app/roster/page.tsx",["staff.map((member)", "member.photo", "object-cover", "sm:h-24"]);
assert.ok(!source("app/roster/page.tsx").includes("team-staff-2026-27.webp"),"Do not reintroduce the low-quality staff collage");
const approvedBanners = [
 "home","parent-portal","roster","schedule","training","kit",
 "sponsors","conduct","media","finance","about","contact"
];
for(const name of approvedBanners)
 assert.ok(existsSync("public/assets/banners/2026-27/"+name+".webp"),"Missing approved banner: "+name);
check("components/ApprovedPageBanner.tsx",["ApprovedBannerId","2026-27-hd","cufc-hd-image","aria-label","asHeading"]);
check("app/globals.css",[".cufc-hd-frame",".cufc-hd-title","@media (max-width:440px)"]);
for (const name of approvedBanners) assert.ok(existsSync("public/assets/banners/2026-27-hd/"+name+".webp"),"Missing HD banner: "+name);
check("components/PublicPageHero.tsx",["ApprovedPageBanner","asHeading"]);
check("components/PortalHeader.tsx",["pageBanners","/portal","/portal/finances","/admin/finances","ApprovedPageBanner"]);
check("app/home/page.tsx",['banner="home"',"View Next 7 Days","/schedule#current-week"]);
check("app/sponsors/page.tsx",['banner="sponsors"',"home-kit-preview"]);
for(const [path, key] of [
 ["app/about/page.tsx","about"],
 ["app/roster/page.tsx","roster"],
 ["app/schedule/page.tsx","schedule"],
 ["app/development/page.tsx","training"],
 ["app/kit/page.tsx","kit"],
 ["app/media/page.tsx","media"],
 ["app/conduct/page.tsx","conduct"],
 ["app/contact/page.tsx","contact"],
 ["app/parents/page.tsx","parent-portal"],
 ["app/order/page.tsx","kit"]
]) check(path,['banner="'+key+'"']);

// Visual consistency release checks: public page coverage and documentation.
check("components/PublicPageHero.tsx",["cufc-policy-hero","usePageTitle","titleOverride"]);
check("components/ApprovedPageBanner.tsx",["titleOverride","subtitleOverride"]);
check("app/globals.css",["--card-radius","--section-gap",".cufc-policy-hero"]);
check("app/sponsors/page.tsx",['banner="sponsors"',"#packages","#sponsor-form"]);
check("app/media/page.tsx",["PublicMediaGallery","consent-reviewed"]);
check("components/PublicMediaGallery.tsx",["/media-library","album.photo_count > 0","/image"]);
for (const [path,key] of [
 ["app/faq/page.tsx","parent-portal"],
 ["app/game-day/page.tsx","schedule"],
 ["app/end-of-season/page.tsx","about"]
]) check(path,['banner="'+key+'"',"usePageTitle"]);
for (const path of ["app/privacy/page.tsx","app/accessibility/page.tsx","app/photo-safety/page.tsx"]) {
 assert.ok(existsSync(path),"Missing required safety page "+path);
 check(path,["<PublicPageHero"]);
}
// Portal visual consistency and all-route compact header coverage.
check("components/ApprovedPageBanner.tsx",["neutralBackground","cufc-hd-frame--neutral","titleOverride"]);
check("components/PortalHeader.tsx",['neutralBackground={isAdmin && !selectedBanner}',"titleOverride={title}","Family Portal · Team Resources"]);
check("components/MediaLibrary.tsx",["portal-empty-state"]);
check("app/layout.tsx",["portal-consistency.css"]);
check("app/portal-consistency.css",[".approved-page-banner--portal",".portal-empty-state","main.container h1"]);
// Email workflow regression coverage: ensure the backend and manager UI remain present.
for (const name of [
 "app/admin/notifications/page.tsx",
 "migrations/20261112_email_notification_outbox.sql",
 "supabase/functions/notification-dispatch/index.ts",
 "supabase/functions/resend-delivery-webhook/index.ts",
 "supabase/functions/contact-submit/index.ts",
 "supabase/functions/parent-onboarding/index.ts",
 "supabase/functions/parent-actions/index.ts"
]) assert.ok(existsSync(name),"Email workflow file missing: "+name);
check("components/PortalHeader.tsx",["/admin/notifications"]);
check("lib/api.ts",["notificationDispatch"]);
check("supabase/functions/notification-dispatch/index.ts",["Idempotency-Key","RESEND_API_KEY","needs_setup","provider_configured"]);
check("supabase/functions/contact-submit/index.ts",["notification_status","girlsoccer2018@gmail.com"]);
check("supabase/functions/parent-onboarding/index.ts",["email_accepted","manual_link"]);

assert.ok(!existsSync("lib/team-squad.ts"),"Do not republish October's hard-coded minor roster");
console.log("Restoration source checks passed ("+needed.length+" files and role/consent guards).");
console.log("NOTE: browser interaction, parental consent and MFA-account E2E still require real test sessions.");
