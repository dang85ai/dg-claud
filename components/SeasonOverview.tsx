import Link from "next/link";

// Change this date only when the season facts below are reviewed or edited.
const season = {
  updated: "2026-10-01",
  updatedLabel: "October 1, 2026",
  facts: [
    ["Eligible birth year", "To be confirmed", "Ask the team manager about eligibility and placement."],
    ["Training season", "October 6, 2026 – May 18, 2027", "These are the published training dates; game dates are separate."],
    ["Practices per week", "Usually two, October–April", "Tuesday at 6:00 p.m. and Wednesday at 6:15 p.m., with listed cancellations. May currently lists Tuesdays only."],
    ["Typical game day", "To be confirmed", "Check the schedule when games are announced."],
    ["Training locations", "Wednesday: St Cornelius Gym", "Tuesday venue and the gym street address are to be confirmed in your Spond invite."],
    ["Registration status", "To be confirmed", "Contact the manager before registering or requesting an assessment."]
  ]
};

export function SeasonOverview() {
  return (
    <section id="season-at-a-glance" className="section scroll-mt-28 bg-white">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-wide text-red-600">2026–27 Training Season</div>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">U9 Girls Season at a Glance</h2>
          </div>
          <p className="text-sm text-neutral-600">Season information last updated <time dateTime={season.updated}>{season.updatedLabel}</time></p>
        </div>
        <dl className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {season.facts.map(([label, value, detail]) => (
            <div key={label} className="card min-w-0 p-5">
              <dt className="text-sm font-bold text-neutral-600">{label}</dt>
              <dd className="mt-2 font-black">{value}<span className="mt-2 block text-sm font-normal leading-6 text-neutral-600">{detail}</span></dd>
            </div>
          ))}
        </dl>
        <Link href="/schedule#venues" className="mt-4 inline-flex min-h-11 items-center font-bold text-red-600 underline">Venue guidance and full schedule</Link>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <section id="joining" className="card scroll-mt-28 p-6">
            <h3 className="text-xl font-black uppercase">Interested in joining?</h3>
            <p className="mt-3 text-neutral-600">Available roster places and assessment dates are to be confirmed. Ask the manager about eligibility, placement and the next step.</p>
            <Link href="/contact" className="btn btn-primary mt-5">Ask About Joining</Link>
            <p className="mt-3 text-sm text-neutral-600">Parent Portal sign-in is for families with access. It is separate from joining the team.</p>
          </section>
          <section id="fees" className="card scroll-mt-28 p-6">
            <h3 className="text-xl font-black uppercase">Costs & inclusions</h3>
            <p className="mt-3 text-neutral-600">Confirmed team fees are not yet published. Ask the manager for the program cost, what is included, any additional kit or tournament costs, and available payment options.</p>
            <p className="mt-3 text-sm text-neutral-600">Inclusions and payment plans are to be confirmed. Family balances and payment records stay in private team tools.</p>
            <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center font-bold text-red-600 underline">Ask the manager about fees</Link>
          </section>
          <section id="coaches" className="card scroll-mt-28 p-6">
            <h3 className="text-xl font-black uppercase">Meet the coaches</h3>
            <p className="mt-3 text-neutral-600">Coach introductions and verified qualifications will be added once confirmed. Our team focuses on development, confidence, teamwork and enjoyment.</p>
            <Link href="/roster#coaching-staff" className="mt-4 inline-flex min-h-11 items-center font-bold text-red-600 underline">Coaching staff information</Link>
            <Link href="/contact" className="block min-h-11 py-3 font-bold text-red-600 underline">Contact the team manager</Link>
          </section>
        </div>
      </div>
    </section>
  );
}
