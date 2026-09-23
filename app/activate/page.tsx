"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { KeyRound, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";

const DEFAULT_ADMIN_EMAIL = "daniel.f.guerra@gmail.com";

export default function ActivatePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [otp, setOtp] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [status, setStatus] = useState("Checking your activation…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function resolveSession() {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;

      if (tokenHash && type) {
        const verify = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        });

        if (!mounted) return;

        if (!verify.error) {
          window.history.replaceState({}, document.title, "/activate");
        } else {
          setNeedsCode(true);
          setStatus("That email link is no longer valid. Enter the new 6-digit activation code below.");
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setStatus(error.message);
        setNeedsCode(true);
        return;
      }

      if (data.session?.user) {
        setEmail(data.session.user.email ?? DEFAULT_ADMIN_EMAIL);
        setReady(true);
        setNeedsCode(false);
        setStatus("");
      } else {
        setReady(false);
        setNeedsCode(true);
        if (!tokenHash) {
          setStatus("Enter the 6-digit activation code sent to your admin email.");
        }
      }
    }

    resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setEmail(session.user.email ?? DEFAULT_ADMIN_EMAIL);
        setReady(true);
        setNeedsCode(false);
        setStatus("");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || otp.length !== 6) return;

    setBusy(true);
    setStatus("");

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp,
      type: "email"
    });

    if (error) {
      setStatus("That activation code is invalid or expired. Use the newest code sent to your email.");
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      setReady(true);
      setNeedsCode(false);
      setEmail(data.session.user.email ?? email.trim());
      setStatus("");
    } else {
      setStatus("Activation succeeded, but the session did not start. Refresh this page and enter the newest code again.");
    }

    setBusy(false);
  }

  async function setPassword(event: FormEvent<HTMLFormElement>) {
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

    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false }
    });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }

    router.replace("/mfa");
  }

  return (
    <AuthShell eyebrow="Administrator Activation" title={ready ? "Create Your Password" : "Verify Admin Access"}>
      <div className="rounded-2xl bg-neutral-50 p-5">
        <div className="flex items-center gap-2 font-black uppercase">
          <ShieldCheck className="text-red-600" size={18} />
          Secure admin setup
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Verify the one-time activation code, create your private password, then set up MFA before entering the Command Centre.
        </p>
      </div>

      {needsCode && !ready ? (
        <form className="mt-6" onSubmit={verifyCode}>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Admin Email</label>
            <input
              className="field"
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="otp">6-Digit Activation Code</label>
            <input
              className="field text-center text-2xl font-black tracking-[0.35em]"
              id="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              maxLength={6}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={busy || otp.length !== 6}>
            {busy ? "Verifying…" : "Verify Activation Code"}
          </button>
        </form>
      ) : null}

      {ready ? (
        <form className="mt-6" onSubmit={setPassword}>
          <div className="mb-5 text-sm">
            <span className="font-black">Admin email:</span> {email}
          </div>

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
