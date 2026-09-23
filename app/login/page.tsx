"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  ClipboardCheck,
  CreditCard,
  FileText,
  ShieldCheck
} from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/portal");
    });
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.error) {
      setStatus(aal.error.message);
      setLoading(false);
      return;
    }

    if (aal.data.nextLevel === "aal2" && aal.data.currentLevel !== "aal2") {
      router.replace("/mfa");
    } else {
      router.replace("/portal");
    }
  }

  return (
    <AuthShell eyebrow="Private Team Portal" title="Sign In">
      <form onSubmit={submit}>
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="password">Password</label>
          <input className="field" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Signing in…" : "Sign In"}
        </button>

        {status ? <p className="notice mt-5 text-sm">{status}</p> : null}

        <div className="mt-6 rounded-2xl bg-neutral-50 p-5">
          <div className="flex items-center gap-2 font-black uppercase">
            <ShieldCheck className="text-red-600" size={18} /> Invite-only access
          </div>
          <ol className="mt-4 grid gap-2 text-sm text-neutral-600">
            <li><strong>1.</strong> Receive a team invitation from the manager.</li>
            <li><strong>2.</strong> Create or activate your account with the invited email address.</li>
            <li><strong>3.</strong> Complete player information, forms and consent choices.</li>
            <li><strong>4.</strong> Sign in here to use the parent tools.</li>
          </ol>
          <p className="mt-4 text-xs text-neutral-500">
            Managers and administrators must complete MFA before accessing protected management tools.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { Icon: ClipboardCheck, title: "Attendance", text: "Mark player availability for games and practices." },
            { Icon: Car, title: "Carpool", text: "Offer or request rides using approved neighbourhood areas." },
            { Icon: FileText, title: "Forms", text: "Complete medical and photo-consent forms." },
            { Icon: CreditCard, title: "Payments", text: "Review team kit and payment status." }
          ].map(({ Icon, title, text }) => (
            <div className="rounded-2xl border border-neutral-200 p-4" key={title}>
              <Icon className="text-red-600" size={19} />
              <div className="mt-2 font-black uppercase">{title}</div>
              <p className="mt-1 text-xs text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </form>
    </AuthShell>
  );
}
