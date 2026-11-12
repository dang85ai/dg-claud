import Link from "next/link";
import { ShieldCheck, Users, HeartHandshake, AlertTriangle, ClipboardCheck, Download } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { PublicPageHero } from "@/components/PublicPageHero";
import { DevelopmentBanner } from "@/components/DevelopmentBanner";

const playerRules = [
 "Respect teammates, coaches, referees and opponents.",
 "Treat everyone equally, regardless of skill level or ability.",
 "NO BULLYING: No teasing, name-calling, intimidation, harassment or excluding others.",
 "Never make fun of another player's mistakes or performance.",
 "Be a good teammate by encouraging and supporting others.",
 "Listen to coaches, show good sportsmanship and give your best effort.",
 "Report bullying or inappropriate behaviour to a coach or club representative."
];
const parentRules = [
 "Respect coaches, referees, players and other families.",
 "Allow coaches to coach and players to play.",
 "Support all players, not just your own child.",
 "Never yell at, criticize or embarrass another child.",
 "Maintain positive sideline behaviour.",
 "Follow the club's communication process when raising concerns.",
 "Never participate in bullying, gossip, harassment or negative behaviour toward players, families or staff.",
 "Lead by example and encourage development over winning."
];
const reporting = [
 ["Report the concern","Players or parents should report incidents to their coach or team manager."],
 ["Escalate if necessary","If the concern involves the coach, team manager, or is not resolved, contact the Grassroots Manager or club administration directly."],
 ["Provide details","Include what happened, when and where it happened, who was involved and any relevant witnesses or messages."],
 ["Club review","The club will review the concern, speak with the appropriate individuals and determine the next steps."],
 ["Follow-up","Appropriate action will be taken, and the reporting family will receive an update while respecting everyone's privacy."]
] as const;
const documentLink="/docs/caledon-soccer-grassroots-code-of-conduct-2026.pdf";

export default function ConductPage() {
 return <PublicShell>
  <DevelopmentBanner/>
  <PublicPageHero banner="conduct" eyebrow="Caledon Soccer · Grassroots" title="Player & Parent Code of Conduct"
   copy="Respect • Teamwork • Development • Zero Bullying"/>
  <section className="section">
   <div className="container">
    <p className="max-w-4xl text-base leading-7 text-neutral-700">
     At Caledon Soccer, we are committed to providing a safe, positive and inclusive environment where every player feels welcome, respected and encouraged to develop.
    </p>
    <div className="mt-7 flex flex-wrap gap-3">
     <a className="btn btn-primary" href={documentLink} target="_blank" rel="noopener noreferrer"><Download size={18}/> Read Original 3-Page PDF</a>
     <Link className="btn btn-light" href="/portal/conduct"><ClipboardCheck size={18}/> Parent Sign-Off</Link>
    </div>
    <p className="mt-3 text-xs text-neutral-500">The rules below reproduce the uploaded Caledon Soccer Grassroots Player & Parent Code of Conduct. The original PDF is the controlling document if there is a difference in formatting.</p>

    <div className="mt-9 grid gap-6 lg:grid-cols-2">
     <section className="card p-6">
      <h2 className="flex items-center gap-2 text-2xl font-black uppercase"><Users className="text-red-600" aria-hidden="true"/> Player Code of Conduct</h2>
      <p className="mt-3 text-sm font-semibold text-neutral-600">All players are expected to:</p>
      <ul className="mt-4 space-y-3">{playerRules.map(rule=><li key={rule} className="flex items-start gap-3 text-sm leading-6"><ShieldCheck size={18} className="mt-1 shrink-0 text-red-600" aria-hidden="true"/><span>{rule}</span></li>)}</ul>
     </section>
     <section className="card p-6">
      <h2 className="flex items-center gap-2 text-2xl font-black uppercase"><HeartHandshake className="text-red-600" aria-hidden="true"/> Parent/Guardian Code of Conduct</h2>
      <p className="mt-3 text-sm font-semibold text-neutral-600">All parents and guardians are expected to:</p>
      <ul className="mt-4 space-y-3">{parentRules.map(rule=><li key={rule} className="flex items-start gap-3 text-sm leading-6"><ShieldCheck size={18} className="mt-1 shrink-0 text-red-600" aria-hidden="true"/><span>{rule}</span></li>)}</ul>
     </section>
    </div>

    <section className="card mt-6 p-6">
     <h2 className="text-2xl font-black uppercase">Reporting Process — Speak Up!</h2>
     <p className="mt-3 text-sm text-neutral-700">Caledon Soccer takes all reports of bullying, harassment and inappropriate behaviour seriously.</p>
     <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {reporting.map(([title,body],i)=><li className="rounded-2xl bg-neutral-50 p-4" key={title}><span className="text-xs font-black uppercase text-red-600">Step {i+1}</span><h3 className="mt-2 text-sm font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p></li>)}
     </ol>
     <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-900">
      Important: Do not confront another child or family directly. Serious incidents, threats or immediate safety concerns should be reported to club administration immediately. Do not wait for the normal reporting process if someone is at risk.
     </p>
    </section>

    <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6">
     <h2 className="flex items-center gap-2 text-2xl font-black uppercase"><AlertTriangle className="text-red-600" aria-hidden="true"/> Accountability</h2>
     <p className="mt-3 text-sm leading-6">Bullying, harassment, intimidation, discrimination and abusive behaviour will not be tolerated.</p>
     <p className="mt-3 text-sm leading-6">Violations may result in verbal or written warnings, meetings with club representatives, removal from the field, suspension or further disciplinary action, depending on the severity of the incident.</p>
     <p className="mt-5 text-xl font-black uppercase text-red-700">One Club. One Team. One Standard. Zero Tolerance for Bullying.</p>
     <p className="mt-3 text-sm leading-6">Every child deserves to feel safe, included and respected. We are here to develop players, build friendships and create a positive soccer experience for everyone.</p>
    </section>

    <section className="mt-6 rounded-2xl bg-neutral-950 p-6 text-white">
     <h2 className="text-2xl font-black uppercase">Player & Parent Acknowledgement</h2>
     <p className="mt-4 text-sm leading-6 text-white/80">We have read and agree to follow the Caledon Soccer Grassroots Player & Parent Code of Conduct.</p>
     <p className="mt-3 text-sm leading-6 text-white/70">The original document has spaces for the player’s name, team/age group, player signature, parent/guardian name, parent/guardian signature and date. A guardian can complete the corresponding electronic record in the private team portal.</p>
     <Link className="btn btn-primary mt-5" href="/portal/conduct">Complete Family Sign-Off</Link>
    </section>
   </div>
  </section>
 </PublicShell>;
}
