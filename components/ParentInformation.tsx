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
    <h2 className="text-2xl font-black uppercase">Training venue access</h2>
    <p className="mt-4 text-neutral-600">Exact training locations, start times, entrances and parking instructions are shared through Spond rather than published on the public website.</p>
    <div className="mt-4 grid gap-4">
      <div><h3 className="font-black">Before leaving</h3><p className="mt-1 text-neutral-600">Open the latest Spond invite and confirm the venue, start time, arrival instructions and footwear requirements.</p></div>
      <div><h3 className="font-black">If information conflicts</h3><p className="mt-1 text-neutral-600">Treat the latest Spond update as the primary event source and contact the team manager if anything is unclear.</p></div>
      <div className="rounded-xl bg-neutral-100 p-4"><h3 className="font-black">Club facilities</h3><p className="mt-1 text-neutral-600">Use the club facilities directory only after your event identifies the facility. The club office is not a training destination unless your private event information explicitly says so.</p><a href="https://caledonsoccer.com/about-us/facilities/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center font-bold text-red-600 underline">Club field maps &amp; addresses</a></div>
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
      <li><Link href="/login" className="font-bold text-red-600 underline">Sign in to the Parent Portal</Link> and review private information and any requested forms.</li>
      <li><a href="https://sgoxywyhaketjmdmkzhm.supabase.co/functions/v1/team-calendar" className="font-bold text-red-600 underline">Add the team calendar</a>. Check Spond for changes; an imported calendar may need to be imported again to reflect updates.</li>
      <li>Review the <Link href="/kit" className="font-bold text-red-600 underline">team kit</Link> and <Link href="/game-day" className="font-bold text-red-600 underline">equipment checklist</Link>.</li>
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
