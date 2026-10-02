import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const groups = [
  {
    id: "home",
    title: "Home Match Kit",
    subtitle: "Black / White",
    image: "/kit/home-team-kit.webp",
    imageAlt: "Caledon U9 Girls 2026 home match kit visual showing the black adidas Tiro26 jersey, shorts, socks and decoration placement.",
    regular: 1620,
    best: 1484.85,
    perPlayer: 108,
    items: [
      { sku: "KB1319", product: "adidas Tiro26 League Kids Jersey", colour: "Black / White", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "Black / White", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-HK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "away",
    title: "Away Match Kit",
    subtitle: "White / Black",
    image: "/kit/away-team-kit.webp",
    imageAlt: "Caledon U9 Girls 2026 away match kit visual showing the white adidas Tiro26 jersey, black shorts, white socks and decoration placement.",
    regular: 1620,
    best: 1484.85,
    perPlayer: 108,
    items: [
      { sku: "KB1317", product: "adidas Tiro26 League Kids Jersey", colour: "White / White / Black", regular: 40, best: 40, retailer: "Adidas Canada / Sport Chek" },
      { sku: "KA8819", product: "adidas Tiro26 League Kids Shorts", colour: "Black / White", regular: 30, best: 20.99, retailer: "Sport Chek" },
      { sku: "ADI-25 TEAM", product: "adidas Team Match Socks", colour: "White / Black", regular: 18, best: 18, retailer: "Adidas Canada" },
      { sku: "DEC-AK", product: "Crest + Back Number + Optional Name", colour: "Customization", regular: 20, best: 20, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "tracksuit",
    title: "Track Suit",
    subtitle: "Travel / Warm-up",
    image: "/kit/track-suit.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas tracksuit visual showing the Tiro 24 training jacket, Tiro 26 training pants and player-initial decoration placement.",
    regular: 1500,
    best: 1109.85,
    perPlayer: 100,
    items: [
      { sku: "IJ9958", product: "adidas Tiro 24 Training Jacket Kids", colour: "Black / White", regular: 20, best: 20, retailer: "Adidas Canada" },
      { sku: "KH1770", product: "adidas Tiro 26 League Training Pants Kids", colour: "Black / White", regular: 65, best: 38.99, retailer: "Sport Chek" },
      { sku: "DEC-TS", product: "Crest + Player Initials", colour: "Customization", regular: 15, best: 15, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "jacket",
    title: "Outdoor Jacket",
    subtitle: "Cold Weather / Sideline",
    image: "/kit/outdoor-jacket.webp",
    imageAlt: "Caledon U9 Girls 2026 outdoor jacket visual showing the black adidas Tiro 24 winter jacket with club crest and player initials.",
    regular: 1710,
    best: 1710,
    perPlayer: 114,
    items: [
      { sku: "IP6670", product: "adidas Tiro 24 Winter Jacket Kids", colour: "Black / White", regular: 102, best: 102, retailer: "Adidas Canada" },
      { sku: "DEC-OJ", product: "Crest + Player Initials", colour: "Customization", regular: 12, best: 12, retailer: "Team Supplier / Customizer" }
    ]
  },
  {
    id: "backpack",
    title: "Backpack",
    subtitle: "Travel / Storage",
    image: "/kit/backpack.webp",
    imageAlt: "Caledon U9 Girls 2026 adidas Stadium 4 backpack visual showing the club crest, player initials and storage features.",
    regular: 1200,
    best: 1199.85,
    perPlayer: 80,
    items: [
      { sku: "JJ7421", product: "adidas Stadium 4 Backpack", colour: "Black", regular: 70, best: 69.99, retailer: "Sport Chek" },
      { sku: "DEC-BP", product: "Crest + Player Initials", colour: "Customization", regular: 10, best: 10, retailer: "Team Supplier / Customizer" }
    ]
  }
];

const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Authorization" };
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization || !/^Bearer \S+$/i.test(authorization)) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://sgoxywyhaketjmdmkzhm.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_CxLW1DX-RFPSAr8T1iSbtQ_XTIye7Yy";
  try {
    const response = await fetch(url + "/functions/v1/parent-dashboard", { headers: { Authorization: authorization, apikey: key }, cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Team member access is required." }, { status: response.status === 401 ? 401 : 403, headers });
    const dashboard = await response.json();
    const roles = Array.isArray(dashboard.roles) ? dashboard.roles : [];
    if (!roles.some((role: string) => ["parent_player", "manager", "admin"].includes(role))) return NextResponse.json({ error: "Team member access is required." }, { status: 403, headers });
    return NextResponse.json({ groups: groups.map(({ id, title, regular, best, perPlayer, items }) => ({ id, title, regular, best, perPlayer, items })), packageRegular: 510, packageBest: 465.96 }, { headers });
  } catch {
    return NextResponse.json({ error: "Unable to verify team access. Please try again." }, { status: 503, headers });
  }
}
