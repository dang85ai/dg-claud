import { PublicPageGuide } from "@/components/PublicPageGuide";

import { RosterProfiles } from "@/components/RosterProfiles";
import { PublicPageHero } from "@/components/PublicPageHero";
import { PublicShell } from "@/components/PublicShell";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";
import {
  ClipboardList,
  ShieldCheck,
  UsersRound
} from "lucide-react";


const staff = [["Technical Director","Gabriel Borges"],["Coach","Davinder Budwal"],["Coach","Courtney Quinn"],["Team Manager","Karam Budwal"],["Team Manager","Melissa Catalano"],["Team Manager","Daniel Guerra"],["Team Manager","Natalie Guerra"],["Team Manager","Giuseppe (Joe) Tomaselli"]];

const volunteers = [
  "Team Manager",
  "Treasurer",
  "Social Coordinator",
  "Photo Coordinator",
  "Snack / Event Coordinator"
];

export default function RosterPage() {
  return (
    <PublicShell>
      <DevelopmentBanner />
      <PublicPageHero
        eyebrow="2026–27 Indoor Squad"
        title="Meet the Team"
        copy="Meet our nine-player squad and the staff listed on the official 2026–27 U9 indoor pool roster. Public player cards show guardian-approved first names and confirmed jersey numbers."
      />

      <section className="section">
        <div className="container">
          <div className="notice mb-8 flex gap-3">
            <ShieldCheck className="shrink-0 text-red-600" />
            <p className="text-sm">
              Player photos and profile details appear only when the appropriate guardian consent is active. Private portal access can show additional team information to authorized families.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0"><RosterProfiles /></div>

          <aside className="grid content-start gap-4">
              <div className="card p-5">
                <div className="text-xs font-black uppercase tracking-[.14em] text-red-600">Team Snapshot</div>
                <div className="mt-4 grid gap-3 text-sm">
                  <div><strong>Age group:</strong> U9 Girls</div>
                  <div><strong>Season:</strong> 2026–27 Indoor</div>
                  <div><strong>League:</strong> To be confirmed</div>
                  <div><strong>Division:</strong> To be confirmed</div>
                  <div><strong>Current squad:</strong> 9 players</div>
                </div>
              </div>

              <div className="card p-5">
                <ClipboardList className="text-red-600" />
                <h3 className="mt-3 font-black uppercase">Privacy & Consent</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  To update or withdraw player-profile or photo consent, use the Parent Portal or contact the team manager.
                </p>
              </div>
            </aside>
          </div>

          <section id="coaching-staff" className="mt-10 card scroll-mt-28 overflow-hidden">
            <div className="bg-black p-5 text-white">
              <h2 className="text-2xl font-black uppercase">Coaches & Team Staff</h2>
            </div>
            <p className="bg-white px-5 py-4 text-sm text-neutral-600">Roles verified from the official CUFC F FUN TO Pool roster, printed September 30, 2026. Coach hierarchy and qualifications are not listed.</p>
            <div className="grid gap-px bg-neutral-200 md:grid-cols-3">
              {staff.map(([role, name]) => (
                <div key={name} className="bg-white p-5">
                  <div className="text-xs font-black uppercase text-red-600">{role}</div>
                  <div className="mt-2 font-black">{name}</div>
                  <div className="mt-2 text-sm text-neutral-500">Qualifications to be confirmed</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 card p-6">
            <h2 className="text-2xl font-black uppercase">Parent Volunteer Roles</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Volunteer assignments and contact details will be visible to authorized team families once roles are confirmed.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {volunteers.map((role) => (
                <div key={role} className="rounded-2xl bg-neutral-50 p-4 text-sm font-black uppercase">
                  {role}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
          <section className="card mt-8 p-6" aria-labelledby="roster-family-help">
            <h2 id="roster-family-help" className="text-2xl font-black uppercase">Managing player profiles together</h2>
            <div className="mt-4 grid gap-5 text-sm leading-7 text-neutral-600 md:grid-cols-2">
              <p>Parents can open My Players in the Parent Portal to request a connection to their child. Include the child’s name, your relationship and information the team manager can verify against registration. A request stays pending until a manager approves it. Simply choosing a child’s name does not grant access. Each co-guardian can use a separate account, and managers can remove an outdated family link when circumstances change. Keep verification details private and leave medical information and identity documents out of the request.</p>
              <p>Once linked, a parent can correct the jersey number or choose a developing position. A blank number means “Number pending”; it does not mean the player is missing from the team. Display-name changes go to manager review before the public name changes. For a roster portrait, first complete the Photo &amp; Media Consent form. Choose a photo, adjust the square crop, check the circular preview and confirm the crop before saving. The image is processed to remove location metadata and reviewed before public use.</p>
              <p>The field below the profiles is a shared illustration of the team’s formation. It is not a promise of a starting place or a record of playing time. Managers assign the position slots, while families can update the position shown in their child’s details. Empty markers show positions awaiting assignment; players without a slot remain part of the rotating squad. Tap a marker to read its details. Managers have keyboard-friendly selectors as well as drag controls, so arranging the field does not depend on using a mouse.</p>
              <p>Profile visibility and photo permission are checked separately. A private player record can still be managed by its verified family without being published on the public roster. Managers review current consent before publishing a name or portrait and can choose whether an approved profile appears on the public field. Withdrawing consent prevents further public display. Contact the manager privately if a correction involves family access or consent, rather than putting a child’s surname, birth date or household information in a public message.</p>
            </div>
          </section>
          <PublicPageGuide page="/roster" />
    </PublicShell>
  );
}
