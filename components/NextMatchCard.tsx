import { CalendarDays, Clock3, MapPin } from "lucide-react";

export function NextMatchCard() {
  return (
    <div className="card overflow-hidden">
      <div className="bg-black px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-white">
        Next Game
      </div>
      <div className="p-6">
        <div className="text-sm font-black uppercase text-red-600">Schedule coming soon</div>
        <h3 className="mt-2 text-3xl font-black uppercase tracking-tight">2026 Season</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Once the official schedule is loaded, kickoff, arrival time, field and uniform details will appear here.
        </p>
        <div className="mt-5 grid gap-3 text-sm text-neutral-700">
          <div className="flex items-center gap-2"><CalendarDays size={18} /> Date to be confirmed</div>
          <div className="flex items-center gap-2"><Clock3 size={18} /> Time to be confirmed</div>
          <div className="flex items-center gap-2"><MapPin size={18} /> Field to be confirmed</div>
        </div>
      </div>
    </div>
  );
}
