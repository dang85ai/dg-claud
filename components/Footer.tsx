import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-black py-12 text-white">
      <div className="container grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="text-2xl font-black uppercase">Caledon U9 Girls</div>
          <p className="mt-3 max-w-md text-sm text-white/65">
            A mobile-first team hub for the 2026 season, built around player safety,
            parent clarity and a strong team culture.
          </p>
        </div>

        <div>
          <div className="font-black uppercase tracking-wide">Contact</div>
          <p className="mt-3 text-sm">girlsoccer@r5play.net</p>
          <p className="mt-1 text-sm">1-(855) 592-6444</p>
        </div>

        <div>
          <div className="font-black uppercase tracking-wide">Team Policies</div>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link href="/privacy">Privacy & Youth Safety</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/photo-safety">Photo & Media Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
