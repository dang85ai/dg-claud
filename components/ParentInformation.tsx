import Link from "next/link";

export function CommunicationGuide() {
  return <section id="communications" className="card scroll-mt-28 p-6">
    <h2 className="text-2xl font-black uppercase">Where to check and reply</h2>
    <dl className="mt-4 grid gap-5">
      <div><dt className="font-black">Spond: event invites and replies</dt><dd className="mt-1 text-neutral-600">Training invites go out three days in advance. Check the venue and coach&apos;s instructions, and respond in the invite when attendance is requested.</dd></div>
      <div><dt className="font-black">Website: schedule and parent information</dt><dd className="mt-1 text-neutral-600">Use the calendar to plan ahead. Before leaving, check your latest Spond invite and team messages for changes.</dd></div>
      <div><dt className="font-black">Parent Portal: private team tools</dt><dd className="mt-1 text-neutral-600">Use your existing parent login for private information and available attendance tools. A portal update should not be assumed to update your Spond reply.</dd></div>
      <div><dt className="font-black">Late, absent or conflicting information?</dt><dd className="mt-1 text-neutral-600">Tell the team manager or coach through the team communication channel. If the website and invite disagree, ask the manager to confirm before travelling.</dd></div>
    </dl>
    <div className="mt-5 flex flex-wrap gap-3"><a href="https://spond.com/client/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Open Spond</a><Link href="/login" className="btn btn-light">Parent Login</Link><Link href="/contact" className="btn btn-light">Contact Manager</Link></div>
  </section>;
}

export function VenueGuide() {
  return <section id="venues" className="card scroll-mt-28 p-6">
    <h2 className="text-2xl font-black uppercase">Training venues & directions</h2>
    <div className="mt-4 grid gap-5">
      <div><h3 className="font-black">Tuesday · 6:00 p.m.</h3><p className="mt-1 text-neutral-600">Venue to be confirmed. Check your Spond invite or ask the team manager before travelling.</p></div>
      <div><h3 className="font-black">Wednesday · 6:15 p.m. · St Cornelius Gym</h3><p className="mt-1 text-neutral-600">The schedule names the gym but does not include a verified street address. Confirm the address, entrance door, parking and indoor footwear requirements in your invite.</p></div>
      <div className="rounded-xl bg-neutral-100 p-4"><h3 className="font-black">Outdoor club fields</h3><p className="mt-1 text-neutral-600">The club directory includes field maps and entrances for Caledon East Soccer Complex, Johnston Sports Park and Fire Hall Field. Use the venue named in your event; these are not confirmed Tuesday training locations.</p><a href="https://caledonsoccer.com/about-us/facilities/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-bold text-red-600 underline">Club field maps & addresses</a></div>
      <p className="text-sm font-bold">2 McKee Drive South is the club office. It is not a training destination unless your event explicitly says so.</p>
    </div>
  </section>;
}

export function WeatherGuide() {
  return <section id="weather" className="card scroll-mt-28 p-6">
    <h2 className="text-2xl font-black uppercase">Weather & cancellations</h2>
    <p className="mt-4 text-neutral-600">Check your event status and latest team message before leaving. A forecast alone does not confirm a cancellation.</p>
    <p className="mt-3 text-neutral-600">The club uses email notifications for heat alerts and unplayable fields. At its fields, the thunder/lightning horn signals everyone to leave the fields for shelter in a vehicle or building.</p>
    <a href="https://caledonsoccer.com/about-us/weather-policy/" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center font-bold text-red-600 underline">Read the official club weather policy</a>
  </section>;
}

export function NewFamilyGuide() {
  return <section id="start-here" className="card scroll-mt-28 p-6">
    <h2 className="text-2xl font-black uppercase">New to the team? Start here</h2>
    <ol className="mt-5 list-decimal space-y-4 pl-6 text-neutral-700">
      <li>Ask the <Link href="/contact" className="font-bold text-red-600 underline">team manager</Link> for the team&apos;s Spond invitation and parent access.</li>
      <li><Link href="/login" className="font-bold text-red-600 underline">Sign in to the Parent Portal</Link> with existing access. Ask the manager for access if you do not have it.</li>
      <li>Review <Link href="/login" className="font-bold text-red-600 underline">forms in your private portal</Link>. Complete forms the team or club specifically asks for; the mandatory form list is to be confirmed.</li>
      <li>Read the <Link href="/conduct" className="font-bold text-red-600 underline">code of conduct</Link> and use the <Link href="/kit" className="font-bold text-red-600 underline">kit ordering guidance</Link>. Confirm order deadlines and costs with the manager.</li>
      <li>Review <Link href="/parents#communications" className="font-bold text-red-600 underline">absence reporting</Link> and reply in Spond when attendance is requested.</li>
      <li><a href="https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/team-calendar" className="font-bold text-red-600 underline">Add the team calendar</a>. Check Spond for changes; an imported calendar may need to be imported again to reflect updates.</li>
      <li>Pack using the <Link href="/game-day" className="font-bold text-red-600 underline">first-session equipment checklist</Link>.</li>
      <li>Confirm the venue, arrival time and footwear before the first session. Read the <Link href="/conduct" className="font-bold text-red-600 underline">team expectations</Link> and club safety resources below.</li>
    </ol>
  </section>;
}

const clubResources = [
  ["Field maps & facilities", "Addresses, entrances and park guidance", "https://caledonsoccer.com/about-us/facilities/"],
  ["Weather policy", "Club cancellation notifications and field procedures", "https://caledonsoccer.com/about-us/weather-policy/"],
  ["Concussion resources", "Parent information and the ages 10 and under booklet", "https://caledonsoccer.com/about-us/rowans-law/"],
  ["Club policies & parent resources", "Conduct, uniforms, healthy snacks and child protection", "https://caledonsoccer.com/about-us/documents/"],
  ["Registration", "Official club registration information", "https://caledonsoccer.com/registration/"],
  ["Refund inquiries", "Check the policy for your program; ask the club about competitive refunds", "https://caledonsoccer.com/registration/refund-policy/"],
  ["Financial assistance", "Club information about Jumpstart", "https://caledonsoccer.com/registration/jumpstart/"],
  ["Club key dates", "Check the season and program before adding a club event", "https://caledonsoccer.com/about-us/key-dates/"]
];

export function ClubResources() {
  return <section id="club-resources" className="scroll-mt-28">
    <h2 className="text-2xl font-black uppercase">Official club resources</h2>
    <p className="mt-3 text-neutral-600">These links open Caledon Soccer Club&apos;s information. Policies and dates can differ by program and season.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{clubResources.map(([title, description, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="card p-5 hover:border-red-500"><h3 className="font-black text-red-600 underline">{title}</h3><p className="mt-2 text-neutral-600">{description}</p></a>)}</div>
  </section>;
}
