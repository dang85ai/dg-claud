import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  eyebrow,
  children
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="inline-flex min-h-12 items-center text-sm font-black uppercase tracking-wide text-white/70">
          ← Back to team site
        </Link>
        <div className="mt-10 rounded-[28px] border border-white/10 bg-white p-6 text-black shadow-2xl md:p-8">
          <div className="text-xs font-black uppercase tracking-[.16em] text-red-600">{eyebrow}</div>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-.04em]">{title}</h1>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
