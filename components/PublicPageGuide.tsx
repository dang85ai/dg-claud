import Link from "next/link";
import guideData from "@/lib/public-page-guides.json";

type GuidePath = keyof typeof guideData.pages;
type SectionKey = keyof typeof guideData.sections;

export function PublicPageGuide({ page }: { page: GuidePath }) {
  const guide = guideData.pages[page];
  return (
    <section className="section border-t border-neutral-200 bg-neutral-50" aria-labelledby="family-guide-title">
      <div className="container">
        <div className="mb-8 max-w-3xl">
          <div className="kicker">Helpful information</div>
          <h2 id="family-guide-title" className="mt-3 text-3xl font-black tracking-tight md:text-4xl">{guide.title}</h2>
          <p className="mt-4 text-base leading-7 text-neutral-700">{guide.intro}</p>
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-24">
            <nav aria-label="Guide sections">
              <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500">In this guide</h3>
              <ol className="mt-3 grid gap-2">
                {guide.sections.map((key, index) => <li key={key}><a href={`#family-guide-${index + 1}`} className="block rounded-lg px-2 py-2 text-sm font-semibold text-neutral-800 hover:bg-red-50 hover:text-red-700">{guideData.sections[key as SectionKey].title}</a></li>)}
              </ol>
            </nav>
            <div className="mt-5 grid gap-2 border-t border-neutral-200 pt-4">
              {guide.links.map(([label, href]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-sm font-bold text-red-700 hover:underline">{label}<span className="ml-2" aria-hidden="true">→</span></Link>)}
            </div>
          </aside>
          <div className="grid max-w-3xl gap-5">
            {guide.sections.map((key, index) => {
              const section = guideData.sections[key as SectionKey];
              return <article id={`family-guide-${index + 1}`} key={key} className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
                <div className="mb-3 flex items-center gap-3"><span className="h-1 w-8 rounded bg-red-600" aria-hidden="true"/><span className="text-xs font-bold tracking-widest text-neutral-500">{String(index + 1).padStart(2, "0")}</span></div>
                <h3 className="text-xl font-bold tracking-tight md:text-2xl">{section.title}</h3>
                {section.paragraphs.map((text, paragraphIndex) => <p key={paragraphIndex} className="mt-4 text-base leading-7 text-neutral-700">{text}</p>)}
              </article>;
            })}
            <a href="#main-content" className="inline-flex min-h-11 items-center text-sm font-bold text-red-700 hover:underline">Back to page overview ↑</a>
          </div>
        </div>
      </div>
    </section>
  );
}
