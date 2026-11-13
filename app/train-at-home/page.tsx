import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Clock3, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/PublicShell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Train at Home",
  description: "Five playful soccer drills for girls ages 6–8 and an easy 15-minute home practice plan for families.",
  path: "/train-at-home"
});

const drills = [
  {
    id: "traffic-light", title: "Traffic Light Dribbling", focus: "Control and reaction",
    setup: "Mark a short lane in a clear space. A grown-up calls the colours.",
    play: "Green means dribble a little quicker. Yellow means take tiny touches. Red means stop the ball gently with the sole of your foot.",
    challenge: "Call “Roundabout!” and have her circle the stopped ball once before dribbling again."
  },
  {
    id: "cone-weave", title: "Cone Weave", focus: "Close control and both feet",
    setup: "Line up five or six cones, shoes or soft markers about 60 cm (2 ft) apart. Spread them out if she needs more room.",
    play: "Weave through the markers with small touches, trying the inside and outside of both feet. Keep the ball within an imaginary hula hoop.",
    challenge: "Count clean runs or let her time a personal best if she enjoys it."
  },
  {
    id: "wall-passes", title: "Wall Passes", focus: "Passing and first touch",
    setup: "Choose a sturdy, flat wall with permission. Clear the rebound area and stay away from windows and doors.",
    play: "Pass gently, stop the rebound with one touch, then pass again. Try both feet.",
    challenge: "When the rebound feels easy to control, try passing it back with one touch. A partner can return the ball if there’s no suitable wall."
  },
  {
    id: "agility-ladder", title: "Agility Ladder", focus: "Footwork and coordination",
    setup: "Draw a short ladder with chalk on a dry, level surface, or use flat tape on a nonslip floor.",
    play: "Walk through with one foot in each square. Try two feet in each square next. Repeat in short rounds with breaks.",
    challenge: "Pick up the pace a little once the pattern feels smooth."
  },
  {
    id: "toe-taps", title: "Toe Taps & Sole Rolls", focus: "Rhythm and balance",
    setup: "Use a ball and a small, clear space with good footing.",
    play: "Alternate light taps on top of the ball, up to 30 seconds at a comfortable pace. Then use the sole to roll it side to side or forward and back.",
    challenge: "Try a smooth left-right rhythm. Take a break or switch drills whenever she likes."
  }
];

const session = [
  { minutes: 3, title: "Warm up", detail: "Move gently for 1 minute, then do 30 seconds of toe taps and 30 seconds of sole rolls. Repeat the taps and rolls once." },
  { minutes: 7, title: "Build ball control", detail: "Try 5 minutes of cone weave and 2 minutes of wall or partner passes. Switch feet along the way." },
  { minutes: 4, title: "Play a footwork game", detail: "Pick agility ladder or traffic lights. Take short breaks between turns." },
  { minutes: 1, title: "Finish with a favourite", detail: "Try a bounce-and-juggle or gently pop the ball off a thigh and catch it." }
];

export default function TrainAtHomePage() {
  return (
    <PublicShell>
      <section className="bg-neutral-950 text-white">
        <div className="container grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
          <div>
            <Link href="/development" className="inline-flex min-h-11 items-center text-sm font-bold text-red-300 underline underline-offset-4">Player development</Link>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">Train at Home</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-neutral-200">Five soccer games for girls ages 6–8. Build confidence with the ball through playful touches, quick reactions and simple footwork.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#session" className="btn btn-primary"><Clock3 size={18} aria-hidden="true" /> 15-minute session</a>
              <a href="#drills" className="btn border border-white/40 text-white"><ArrowDown size={18} aria-hidden="true" /> Browse drills</a>
            </div>
          </div>
          <Image src="/assets/train-at-home/equipment.webp" alt="" width={512} height={512} priority className="aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </section>

      <div className="container py-10 sm:py-14">
        <section id="session" aria-labelledby="session-title" className="scroll-mt-24">
          <h2 id="session-title" className="text-3xl font-black uppercase tracking-tight sm:text-4xl">15-minute home session</h2>
          <p className="mt-3 text-neutral-700">Grab a ball and a few markers. Let your player choose the footwork game.</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {session.map(step => (
              <li key={step.title} className="card border-t-4 border-t-red-700 p-5">
                <p className="text-sm font-black uppercase tracking-wide text-red-800">{step.minutes} min</p>
                <h3 className="mt-2 text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-700">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="drills" aria-labelledby="drills-title" className="mt-12 scroll-mt-24">
          <h2 id="drills-title" className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Pick a drill</h2>
          <p className="mt-3 text-neutral-700">Start at a comfortable pace and keep the ball close. A few playful minutes are enough to get started.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {drills.map(drill => (
              <article key={drill.id} className="card overflow-hidden">
                <Image src={`/assets/train-at-home/${drill.id}.webp`} alt="" width={512} height={512} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-square w-full object-cover" />
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-black uppercase tracking-wide text-red-800">{drill.focus}</p>
                  <h3 className="mt-2 text-xl font-black">{drill.title}</h3>
                  <dl className="mt-4 grid gap-3 text-sm leading-6 text-neutral-700">
                    <div><dt className="font-bold text-neutral-950">Set up</dt><dd>{drill.setup}</dd></div>
                    <div><dt className="font-bold text-neutral-950">Play</dt><dd>{drill.play}</dd></div>
                    <div><dt className="font-bold text-neutral-950">Try next</dt><dd>{drill.challenge}</dd></div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="mt-10 flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7">
          <ShieldCheck size={25} className="shrink-0 text-red-800" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-black">Keep it playful</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-700">Clear the play area, use a dry surface and keep water handy. Aim for 15–20 minutes on days she feels like playing. Take breaks and finish early if she gets tired or wants to stop. Praise the attempt and let her pick a favourite drill.</p>
            <a className="mt-3 inline-flex min-h-11 items-center font-bold text-red-800 underline underline-offset-4" href="https://canadasoccer.com/play/grassroots-soccer/">Canada Soccer grassroots guidance</a>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
}

