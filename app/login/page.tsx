"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

        <p className="mt-6 text-sm text-neutral-600">
          Accounts are invite-only. Managers and administrators must complete MFA before accessing protected management tools.
        </p>
      </form>
    </AuthShell>
  );
}
