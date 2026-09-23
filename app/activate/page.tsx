"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { KeyRound, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

export default function ActivatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Checking your activation link…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function resolveSession() {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash") || url.searchParams.get("token");
      const type = url.searchParams.get("type") as EmailOtpType | null;

      if (tokenHash && type) {
        const verify = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        });

        if (!mounted) return;

        if (verify.error) {
          setStatus(verify.error.message);
          setReady(false);
          return;
        }

        // Remove the one-time token from browser history after it has been exchanged.
        window.history.replaceState({}, document.title, "/activate");
      }

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setStatus(error.message);
        setReady(false);
        return;
      }

      if (data.session?.user) {
        setEmail(data.session.user.email ?? "");
        setReady(true);
        setStatus("");
      } else {
        setReady(false);
        setStatus("Open this page from the secure activation link sent to your admin email.");
      }
    }

    resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setEmail(session.user.email ?? "");
        setReady(true);
        setStatus("");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 12) {
      setStatus("Use a password with at least 12 characters.");
      setBusy(false);
      return;
    }

    if (password !== confirm) {
      setStatus("The two passwords do not match.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }

    router.replace("/mfa");
  }

  return (
    <AuthShell eyebrow="Administrator Activation" title="Create Your Password">
      <div className="rounded-2xl bg-neutral-50 p-5">
        <div className="flex items-center gap-2 font-black uppercase">
          <ShieldCheck className="text-red-600" size={18} />
          Secure admin setup
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Your one-time activation link signs you in securely. Create your private password here, then set up MFA before entering the Command Centre.
        </p>
        {email ? (
          <div className="mt-4 text-sm">
            <span className="font-black">Admin email:</span> {email}
          </div>
        ) : null}
      </div>

      {ready ? (
        <form className="mt-6" onSubmit={submit}>
          <div className="field-group">
            <label className="field-label" htmlFor="password">New Password</label>
            <input
              className="field"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="confirm">Confirm Password</label>
            <input
              className="field"
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            <KeyRound size={18} />
            {busy ? "Saving…" : "Set Password & Continue to MFA"}
          </button>
        </form>
      ) : null}

      {status ? <div className="notice mt-5 text-sm">{status}</div> : null}
    </AuthShell>
  );
}
